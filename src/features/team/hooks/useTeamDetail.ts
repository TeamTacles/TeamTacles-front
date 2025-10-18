// src/features/team/hooks/useTeamDetail.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { teamService, InviteByEmailRequest } from '../services/teamService';
import { Team, TeamMemberDetail } from '../../../types/entities';
import { getErrorMessage, getInviteErrorMessage } from '../../../utils/errorHandler';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { RootStackParamList } from '../../../types/navigation';
import { useNotification } from '../../../contexts/NotificationContext';

type TeamDetailRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;
type TeamDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useTeamDetail() {
  const navigation = useNavigation<TeamDetailNavigationProp>();
  const route = useRoute<TeamDetailRouteProp>();
  const { team: initialTeam } = route.params;
  const { showNotification } = useNotification();
  const modalNotificationRef = useRef<NotificationPopupRef>(null);

  // States
  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<TeamMemberDetail[]>([]);
  const [loading, setLoading] = useState(false); // Loading para "carregar mais"
  const [refreshing, setRefreshing] = useState(false); // Loading para pull-to-refresh
  const [initialLoading, setInitialLoading] = useState(true); // Novo estado para carregamento inicial
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberDetail | null>(null);
  const [isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible] = useState(false);
  const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);

  // Ref para controlar chamadas concorrentes
  const isFetching = useRef(false);

  // --- LÓGICA DE PERMISSÃO ---
  const currentUserRole = team.teamRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const fetchMembers = useCallback(async (page: number, isInitialLoad = false, isRefresh = false) => {
    // Previne chamadas concorrentes
    if (isFetching.current) return;
     // Não busca mais se não houver mais páginas (exceto no refresh/initial load)
    if (!hasMore && !isInitialLoad && !isRefresh) return;

    isFetching.current = true; // Marca como buscando

    if (isInitialLoad) {
      setInitialLoading(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true); // Loading normal para "carregar mais"
    }

    try {
      // Garantir que a página seja 0 no carregamento inicial ou refresh
      const pageToFetch = isInitialLoad || isRefresh ? 0 : page;
      const response = await teamService.getTeamMembers(team.id, pageToFetch, 10);
      const membersFromApi = response.content;

      setMembers(prev => {
        // Se for refresh ou carga inicial, substitui. Senão, concatena.
        const currentMembers = (isInitialLoad || isRefresh) ? [] : prev;
        // Evita duplicados (caso a API retorne algo já existente por algum motivo)
        const existingIds = new Set(currentMembers.map(m => m.userId));
        const newMembers = membersFromApi.filter(m => !existingIds.has(m.userId));
        return [...currentMembers, ...newMembers];
      });

      setHasMore(!response.last);
      // Atualiza a página SOMENTE se a busca foi bem-sucedida
      setCurrentPage(pageToFetch + 1);

    } catch (error) {
      showNotification({ type: 'error', message: 'Erro ao carregar membros.' });
      // Se der erro na carga inicial ou refresh, reseta paginação para tentar de novo
       if(isInitialLoad || isRefresh){
           setMembers([]);
           setCurrentPage(0);
           setHasMore(true);
       }
    } finally {
      // Libera o lock e atualiza os estados de loading corretos
      if (isInitialLoad) {
        setInitialLoading(false);
      } else if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [team.id, hasMore, showNotification]); // Remover currentPage daqui

  // Efeito para busca inicial
  useEffect(() => {
    fetchMembers(0, true); // Chama com isInitialLoad = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id]); // Depender apenas do team.id garante que só roda quando o time muda

  // Handler para Refresh (Pull-to-refresh)
  const handleRefresh = useCallback(() => {
      fetchMembers(0, false, true); // Chama com isRefresh = true
  }, [fetchMembers]);

  // Handler para Carregar Mais (Scroll infinito)
  const handleLoadMore = useCallback(() => {
      // Verifica se há mais páginas e se *nenhum* tipo de loading está ativo
      if (hasMore && !loading && !refreshing && !initialLoading && !isFetching.current) {
          fetchMembers(currentPage); // Busca a próxima página (currentPage já foi incrementado)
      }
  }, [hasMore, loading, refreshing, initialLoading, currentPage, fetchMembers]);


  // --- Team Actions ---
  const handleUpdateTeam = async (data: { title: string; description: string }) => {
    // ... (sem alterações)
     try {
      const updatedTeam = await teamService.updateTeam(team.id, { name: data.title, description: data.description });
      setTeam(prev => ({ ...prev!, title: updatedTeam.name, description: updatedTeam.description })); // Atualiza nome ou título
      setEditTeamModalVisible(false);
      showNotification({ type: 'success', message: 'Equipe atualizada com sucesso!' });
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleDeleteTeam = async () => {
     // ... (sem alterações)
    setIsDeleting(true);
    try {
      await teamService.deleteTeam(team.id);
      setConfirmDeleteVisible(false);
      setEditTeamModalVisible(false);
      navigation.goBack();
      setTimeout(() => {
        showNotification({ type: 'success', message: `Equipe "${team.title || (team as any).name}" excluída com sucesso!` });
      }, 500);
    } catch (error) {
      setConfirmDeleteVisible(false);
      showNotification({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Member Actions ---
  const handleSelectMember = (member: TeamMemberDetail) => {
     // ... (sem alterações)
    if (!isAdmin) return;
    setSelectedMember(member);
    setEditMemberModalVisible(true);
  };

  const handleUpdateMemberRole = async (newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    // ... (sem alterações)
    if (!selectedMember) return;
    try {
      await teamService.updateMemberRole(team.id, selectedMember.userId, { newRole });
      // Atualiza localmente para feedback imediato
      setMembers(prev => prev.map(m => m.userId === selectedMember.userId ? { ...m, teamRole: newRole } : m));
      setEditMemberModalVisible(false);
      showNotification({ type: 'success', message: 'Cargo atualizado com sucesso!' });
      // Opcional: chamar handleRefresh() aqui se quiser revalidar TUDO da API
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleRemoveMember = async () => {
    // ... (sem alterações)
     if (!selectedMember) return;
    try {
      await teamService.removeMember(team.id, selectedMember.userId);
      // Atualiza localmente para feedback imediato
      setMembers(prev => prev.filter(m => m.userId !== selectedMember.userId));
      setConfirmRemoveMemberVisible(false);
      setEditMemberModalVisible(false); // Garante que o modal de edição feche também
      showNotification({ type: 'success', message: 'Membro removido com sucesso.' });
    } catch (error) {
      setConfirmRemoveMemberVisible(false); // Garante que o modal de confirmação feche no erro
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  // --- Invite Actions ---
  const handleInviteByEmail = async (email: string, role: 'ADMIN' | 'MEMBER') => {
    // ... (sem alterações)
    try {
      const inviteData: InviteByEmailRequest = { email, role };
      await teamService.inviteUserByEmail(team.id, inviteData);
      modalNotificationRef.current?.show({ type: 'success', message: `Convite enviado para ${email}!` });
      // Não precisa recarregar a lista aqui, o membro só aparecerá após aceitar
    } catch (error) {
      modalNotificationRef.current?.show({ type: 'error', message: getInviteErrorMessage(error) });
    }
  };

  // --- Leave Team Action ---
  const handleLeaveTeam = async () => {
    // ... (sem alterações)
    setIsDeleting(true); // Reutilizar estado de loading
    setConfirmLeaveVisible(false); // Fechar modal de confirmação
    try {
      await teamService.leaveTeam(team.id);
      navigation.goBack(); // Voltar para a tela anterior
      setTimeout(() => {
        showNotification({ type: 'success', message: `Você saiu da equipe "${team.title || (team as any).name}"` });
      }, 500);
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    navigation,
    team,
    members,
    loading, // Loading para "carregar mais"
    refreshing, // Loading para pull-to-refresh
    initialLoading, // Loading inicial
    isDeleting, // Loading para delete/leave
    modalNotificationRef,
    currentUserRole,
    isOwner,
    isAdmin,
    isEditTeamModalVisible, setEditTeamModalVisible,
    isConfirmDeleteVisible, setConfirmDeleteVisible,
    isEditMemberModalVisible, setEditMemberModalVisible,
    isInviteModalVisible, setInviteModalVisible,
    selectedMember, setSelectedMember,
    isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible,
    isConfirmLeaveVisible, setConfirmLeaveVisible,
    handleRefresh, // Para pull-to-refresh
    handleLoadMore, // Para scroll infinito
    handleUpdateTeam,
    handleDeleteTeam,
    handleSelectMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleInviteByEmail,
    handleLeaveTeam,
  };
}
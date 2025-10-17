// src/features/team/hooks/useTeamDetail.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { teamService, InviteByEmailRequest } from '../services/teamService';
import { Team, TeamMemberDetail } from '../../../types/entities';
import { getErrorMessage, getInviteErrorMessage } from '../../../utils/errorHandler';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { RootStackParamList } from '../../../types/navigation';
import { useNotification } from '../../../contexts/NotificationContext';

type TeamDetailRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;

export function useTeamDetail() {
  const navigation = useNavigation();
  const route = useRoute<TeamDetailRouteProp>();
  const { team: initialTeam } = route.params;
  const { showNotification } = useNotification();

  // --- CORREÇÃO: A ref para o modal de notificação é criada aqui ---
  const modalNotificationRef = useRef<NotificationPopupRef>(null);

  // States
  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<TeamMemberDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  // --- LÓGICA DE PERMISSÃO ---
  const currentUserRole = team.teamRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;


  const fetchMembers = useCallback(async (page: number) => {
    if (loading || (page > 0 && refreshing)) return;
    if (!hasMore && page > 0) return;
    const isRefreshing = page === 0;

    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await teamService.getTeamMembers(team.id, page, 10);
      const membersFromApi = response.content;

      if (isRefreshing) {
        setMembers(membersFromApi);
      } else {
        setMembers(prev => [...prev, ...membersFromApi]);
      }
      setHasMore(!response.last);
      setCurrentPage(page + 1);
    } catch (error) {
      showNotification({ type: 'error', message: 'Erro ao carregar membros.' });
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [team.id, hasMore, showNotification]);
  
  useEffect(() => {
    fetchMembers(0);
  }, [fetchMembers]);

  const handleRefresh = () => {
    setCurrentPage(0);
    setHasMore(true);
    fetchMembers(0);
  };

  // --- Team Actions ---
  const handleUpdateTeam = async (data: { title: string; description: string }) => {
    try {
      const updatedTeam = await teamService.updateTeam(team.id, { name: data.title, description: data.description });
      setTeam(prev => ({ ...prev!, title: updatedTeam.name, description: updatedTeam.description }));
      setEditTeamModalVisible(false);
      showNotification({ type: 'success', message: 'Equipe atualizada com sucesso!' });
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      await teamService.deleteTeam(team.id);
      setConfirmDeleteVisible(false);
      setEditTeamModalVisible(false);
      navigation.goBack();
      setTimeout(() => {
        showNotification({ type: 'success', message: `Equipe "${team.title}" excluída com sucesso!` });
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
    if (!isAdmin) return;
    setSelectedMember(member);
    setEditMemberModalVisible(true);
  };

  const handleUpdateMemberRole = async (newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    if (!selectedMember) return;
    try {
      await teamService.updateMemberRole(team.id, selectedMember.userId, { newRole });
      setMembers(prev => prev.map(m => m.userId === selectedMember.userId ? { ...m, teamRole: newRole } : m));
      setEditMemberModalVisible(false);
      showNotification({ type: 'success', message: 'Cargo atualizado com sucesso!' });
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await teamService.removeMember(team.id, selectedMember.userId);
      setMembers(prev => prev.filter(m => m.userId !== selectedMember.userId));
      setConfirmRemoveMemberVisible(false);
      setEditMemberModalVisible(false);
      showNotification({ type: 'success', message: 'Membro removido com sucesso.' });
    } catch (error) {
      setConfirmRemoveMemberVisible(false);
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  // --- Invite Actions ---
  const handleInviteByEmail = async (email: string, role: 'ADMIN' | 'MEMBER') => {
    try {
      const inviteData: InviteByEmailRequest = { email, role };
      await teamService.inviteUserByEmail(team.id, inviteData);
      // Aqui, a notificação deve usar a ref do modal para aparecer na frente
      modalNotificationRef.current?.show({ type: 'success', message: `Convite enviado para ${email}!` });
    } catch (error) {
      modalNotificationRef.current?.show({ type: 'error', message: getInviteErrorMessage(error) });
    }
  };


  return {
    navigation,
    team,
    members,
    loading,
    refreshing,
    isDeleting,
    modalNotificationRef, // --- CORREÇÃO: Exportar a ref criada ---
    currentUserRole,
    isOwner,
    isAdmin,
    isEditTeamModalVisible, setEditTeamModalVisible,
    isConfirmDeleteVisible, setConfirmDeleteVisible,
    isEditMemberModalVisible, setEditMemberModalVisible,
    isInviteModalVisible, setInviteModalVisible,
    selectedMember, setSelectedMember,
    isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible,
    handleRefresh,
    handleLoadMore: () => fetchMembers(currentPage),
    handleUpdateTeam,
    handleDeleteTeam,
    handleSelectMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleInviteByEmail,
  };
}
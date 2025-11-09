import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { teamService, InviteByEmailRequest } from '../services/teamService';
import { Team, TeamMemberDetail } from '../../../types/entities';
import { getErrorMessage, getInviteErrorMessage } from '../../../utils/errorHandler';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { RootStackParamList } from '../../../types/Navigation';
import { useNotification } from '../../../contexts/NotificationContext';

type TeamDetailRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;
type TeamDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useTeamDetail() {
  const navigation = useNavigation<TeamDetailNavigationProp>();
  const route = useRoute<TeamDetailRouteProp>();
  const { team: initialTeam } = route.params;
  const { showNotification } = useNotification();
  const modalNotificationRef = useRef<NotificationPopupRef>(null);

  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<TeamMemberDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberDetail | null>(null);
  const [isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible] = useState(false);
  const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);

  const isFetching = useRef(false);

  const currentUserRole = team.teamRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const fetchMembers = useCallback(async (page: number, isInitialLoad = false, isRefresh = false) => {
    if (isFetching.current) return;
    if (!hasMore && !isInitialLoad && !isRefresh) return;

    isFetching.current = true;

    if (isInitialLoad) {
      setInitialLoading(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const pageToFetch = isInitialLoad || isRefresh ? 0 : page;
      const response = await teamService.getTeamMembers(team.id, pageToFetch, 10);
      const membersFromApi = response.content;

      setMembers(prev => {
        const currentMembers = (isInitialLoad || isRefresh) ? [] : prev;
        const existingIds = new Set(currentMembers.map(m => m.userId));
        const newMembers = membersFromApi.filter(m => !existingIds.has(m.userId));
        return [...currentMembers, ...newMembers];
      });

      setHasMore(!response.last);
      setCurrentPage(pageToFetch + 1);

    } catch (error) {
      showNotification({ type: 'error', message: 'Erro ao carregar membros.' });
      if(isInitialLoad || isRefresh){
           setMembers([]);
           setCurrentPage(0);
           setHasMore(true);
      }
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      } else if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [team.id, hasMore, showNotification]);

  useEffect(() => {
    fetchMembers(0, true);
  }, [team.id]);

  const handleRefresh = useCallback(() => {
      fetchMembers(0, false, true);
  }, [fetchMembers]);

  const handleLoadMore = useCallback(() => {
      if (hasMore && !loading && !refreshing && !initialLoading && !isFetching.current) {
          fetchMembers(currentPage);
      }
  }, [hasMore, loading, refreshing, initialLoading, currentPage, fetchMembers]);

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
        showNotification({ type: 'success', message: `Equipe "${team.title || (team as any).name}" excluída com sucesso!` });
      }, 500);
    } catch (error) {
      setConfirmDeleteVisible(false);
      showNotification({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

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

  const handleInviteByEmail = async (email: string, role: 'ADMIN' | 'MEMBER') => {
    try {
      const inviteData: InviteByEmailRequest = { email, role };
      await teamService.inviteUserByEmail(team.id, inviteData);
      modalNotificationRef.current?.show({ type: 'success', message: `Convite enviado para ${email}!` });
    } catch (error) {
      modalNotificationRef.current?.show({ type: 'error', message: getInviteErrorMessage(error) });
    }
  };

  const handleLeaveTeam = async () => {
    setIsDeleting(true);
    setConfirmLeaveVisible(false);
    try {
      await teamService.leaveTeam(team.id);
      navigation.goBack();
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
    loading,
    refreshing,
    initialLoading,
    isDeleting,
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
    handleRefresh,
    handleLoadMore,
    handleUpdateTeam,
    handleDeleteTeam,
    handleSelectMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleInviteByEmail,
    handleLeaveTeam,
  };
}
import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const modalNotificationRef = useRef<NotificationPopupRef>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberDetail | null>(null);
  const [isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible] = useState(false);
  const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);

  const { data: team } = useQuery({
    queryKey: ['team', initialTeam.id],
    queryFn: async () => {
        try {
            return await teamService.getTeamById(initialTeam.id); 
        } catch (e) {
            return initialTeam; 
        }
    },
    initialData: initialTeam, 
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const currentUserRole = team.teamRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const {
    data: membersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: initialLoadingMembers,
    isRefetching: refreshingMembers,
    refetch: refetchMembers
  } = useInfiniteQuery({
    queryKey: ['team-members', team.id],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await teamService.getTeamMembers(team.id, pageParam, 10);
      return {
        members: response.content,
        nextPage: response.last ? undefined : pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10,   // 10 minutos
  });

  const members = useMemo(() => {
    const allMembers = membersData?.pages.flatMap(page => page.members) ?? [];
    return [...new Map(allMembers.map(m => [m.userId, m])).values()];
  }, [membersData]);


  const handleRefresh = useCallback(() => {
    refetchMembers();
    queryClient.invalidateQueries({ queryKey: ['team', team.id] });
  }, [refetchMembers, queryClient, team.id]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleUpdateTeam = async (data: { title: string; description: string }) => {
    try {
      const updatedTeam = await teamService.updateTeam(team.id, { name: data.title, description: data.description });
      
      queryClient.setQueryData(['team', team.id], (old: Team) => ({ ...old, title: updatedTeam.name, description: updatedTeam.description }));
      
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      
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
      
      queryClient.invalidateQueries({ queryKey: ['teams'] }); 
      queryClient.removeQueries({ queryKey: ['team', team.id] }); 

      setConfirmDeleteVisible(false);
      setEditTeamModalVisible(false);
      navigation.goBack();
      setTimeout(() => {
        showNotification({ type: 'success', message: `Equipe excluída com sucesso!` });
      }, 500);
    } catch (error) {
      setConfirmDeleteVisible(false);
      showNotification({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateMemberRole = async (newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    if (!selectedMember) return;
    try {
      await teamService.updateMemberRole(team.id, selectedMember.userId, { newRole });
      
      queryClient.invalidateQueries({ queryKey: ['team-members', team.id] });
      
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
      
      queryClient.invalidateQueries({ queryKey: ['team-members', team.id] });
      
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
      
      queryClient.invalidateQueries({ queryKey: ['teams'] }); 
      
      navigation.goBack();
      setTimeout(() => {
        showNotification({ type: 'success', message: `Você saiu da equipe` });
      }, 500);
    } catch (error) {
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

  return {
    navigation,
    team,
    
    members,
    loadingMembers: isFetchingNextPage, 
    refreshingMembers: !!refreshingMembers, 
    initialLoading: initialLoadingMembers, 
    
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
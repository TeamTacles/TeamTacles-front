import { useState, useCallback, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { projectService, ProjectTask } from '../services/projectService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { useNotification } from '../../../contexts/NotificationContext';
import { RootStackParamList } from '../../../types/Navigation';
import { useProjectMembers } from './useProjectMembers';

type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

export function useProjectDetail() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailRouteProp>();
  const { projectId, projectRole } = route.params;
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        return await projectService.getProjectById(projectId);
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Erro ao carregar o projeto. Tente novamente.'
        });
        setTimeout(() => navigation.goBack(), 1500);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteMemberModalVisible, setInviteMemberModalVisible] = useState(false);
  const [isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible] = useState(false);
  const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' } | null>(null);

  const currentUserRole = projectRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const { 
    members, 
    loadingMembers, 
    refreshingMembers, 
    handleRefresh: handleRefreshMembers, 
    handleLoadMore: handleLoadMoreMembers, 
    initialLoading: initialLoadingMembers 
  } = useProjectMembers(projectId);

  const {
    data: tasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch: refetchTasks,
    isLoading: initialLoadingTasks,
  } = useInfiniteQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await projectService.getProjectTasks(projectId, pageParam, 10);
      return {
        tasks: response.content,
        nextPage: response.last ? undefined : pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const projectTasks = useMemo(() => {
    const allTasks = tasksData?.pages.flatMap(page => page.tasks) ?? [];
    return [...new Map(allTasks.map(t => [t.id, t])).values()];
  }, [tasksData]);

  const handleRefreshTasks = useCallback(() => {
    refetchTasks();
  }, [refetchTasks]);

  const handleLoadMoreTasks = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isRefetching, fetchNextPage]);

  const handleUpdateProject = async (data: { title: string; description: string }) => {
    if (!project) return;
    try {
      const updatedProject = await projectService.updateProject(project.id, data);
      queryClient.setQueryData(['project', projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditModalVisible(false);
      showNotification({ type: 'success', message: 'Projeto atualizado com sucesso!' });
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setConfirmDeleteVisible(false);
      setEditModalVisible(false);
      navigation.goBack();
      setTimeout(() => {
        showNotification({ type: 'success', message: `Projeto "${project.title}" excluído com sucesso!` });
      }, 500);
    } catch (error) {
      setConfirmDeleteVisible(false);
      showNotification({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectMember = (member: { userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' }) => {
    if (!isAdmin) return;
    setSelectedMember(member);
    setEditMemberModalVisible(true);
  };

  const handleUpdateMemberRole = async (newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    if (!selectedMember) return;
    try {
      await projectService.updateMemberRole(projectId, selectedMember.userId, { newRole });
      
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      
      setEditMemberModalVisible(false);
      handleRefreshMembers();
      showNotification({ type: 'success', message: 'Cargo atualizado com sucesso!' });
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await projectService.removeMember(projectId, selectedMember.userId);
      
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      
      setConfirmRemoveMemberVisible(false);
      setEditMemberModalVisible(false);
      showNotification({ type: 'success', message: 'Membro removido com sucesso.' });
    } catch (error) {
      setConfirmRemoveMemberVisible(false);
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleLeaveProject = async () => {
    if (!project) return;
    setIsDeleting(true);
    setConfirmLeaveVisible(false);
    try {
      await projectService.leaveProject(project.id);
      queryClient.invalidateQueries({ queryKey: ['projects'] }); 
      navigation.goBack();
      setTimeout(() => {
        showNotification({ type: 'success', message: `Você saiu do projeto "${project.title}"` });
      }, 500);
    } catch (error) {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  const addTaskLocally = (newTask: ProjectTask) => {
    queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
  };

  const updateTaskInList = useCallback((taskId: number, updates: Partial<ProjectTask>) => {
    queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
  }, [queryClient, projectId]);

  const removeTaskFromList = useCallback((taskId: number) => {
    queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
  }, [queryClient, projectId]);

  return {
    navigation,
    project,
    loadingProject,
    isDeleting,
    
    members,
    loadingMembers,
    refreshingMembers,
    initialLoadingMembers,
    handleRefreshMembers,
    handleLoadMoreMembers,
    
    projectTasks,
    loadingTasks: isFetchingNextPage,
    refreshingTasks: isRefetching && !isFetchingNextPage,
    initialLoadingTasks,
    handleRefreshTasks,
    handleLoadMoreTasks,
    
    addTaskLocally,
    updateTaskInList,
    removeTaskFromList,
    
    currentUserRole,
    isOwner,
    isAdmin,
    
    isEditModalVisible, setEditModalVisible,
    isConfirmDeleteVisible, setConfirmDeleteVisible,
    isEditMemberModalVisible, setEditMemberModalVisible,
    isInviteMemberModalVisible, setInviteMemberModalVisible,
    isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible,
    isConfirmLeaveVisible, setConfirmLeaveVisible,
    
    selectedMember,
    
    handleUpdateProject,
    handleDeleteProject,
    handleSelectMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleLeaveProject,
  };
}
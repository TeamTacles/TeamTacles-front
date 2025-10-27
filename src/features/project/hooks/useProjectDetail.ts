// src/features/project/hooks/useProjectDetail.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { projectService, ProjectDetails, ProjectTask, UpdateProjectRequest } from '../services/projectService';
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

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [refreshingTasks, setRefreshingTasks] = useState(false);
  const [initialLoadingTasks, setInitialLoadingTasks] = useState(true);
  const [currentPageTasks, setCurrentPageTasks] = useState(0);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteMemberModalVisible, setInviteMemberModalVisible] = useState(false);
  const [isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible] = useState(false);
  const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' } | null>(null);

  const currentUserRole = projectRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const { members, setMembers, loadingMembers, refreshingMembers, handleRefresh: handleRefreshMembers, handleLoadMore: handleLoadMoreMembers, initialLoading: initialLoadingMembers } = useProjectMembers(projectId);

  const isFetchingTasks = useRef(false);

  const fetchTasks = useCallback(async (page: number, isInitialLoad = false, isRefresh = false) => {
    if (isFetchingTasks.current) return;
    if (!hasMoreTasks && !isInitialLoad && !isRefresh) return;

    isFetchingTasks.current = true;

    if (isInitialLoad) {
      setInitialLoadingTasks(true);
    } else if (isRefresh) {
      setRefreshingTasks(true);
    } else {
      setLoadingTasks(true);
    }

    try {
      const pageToFetch = isInitialLoad || isRefresh ? 0 : page;
      const response = await projectService.getProjectTasks(projectId, pageToFetch, 10);
      const tasksFromApi = response.content;

      setProjectTasks(prev => {
        const currentTasks = (isInitialLoad || isRefresh) ? [] : prev;
        const existingIds = new Set(currentTasks.map(t => t.id));
        const newTasks = tasksFromApi.filter(t => !existingIds.has(t.id));
        return [...currentTasks, ...newTasks];
      });

      setHasMoreTasks(!response.last);
      setCurrentPageTasks(pageToFetch + 1);

    } catch (error) {
      showNotification({ type: 'error', message: 'Erro ao carregar tarefas.' });
       if(isInitialLoad || isRefresh){
           setProjectTasks([]);
           setCurrentPageTasks(0);
           setHasMoreTasks(true);
       }
    } finally {
      if (isInitialLoad) {
        setInitialLoadingTasks(false);
      } else if (isRefresh) {
        setRefreshingTasks(false);
      } else {
        setLoadingTasks(false);
      }
      isFetchingTasks.current = false;
    }
  }, [projectId, hasMoreTasks, showNotification]);

  const handleRefreshTasks = useCallback(() => {
      fetchTasks(0, false, true);
  }, [fetchTasks]);

  const handleLoadMoreTasks = useCallback(() => {
      if (hasMoreTasks && !loadingTasks && !refreshingTasks && !initialLoadingTasks && !isFetchingTasks.current) {
          fetchTasks(currentPageTasks);
      }
  }, [hasMoreTasks, loadingTasks, refreshingTasks, initialLoadingTasks, currentPageTasks, fetchTasks]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoadingProject(true);
        const projectData = await projectService.getProjectById(projectId);
        if (isMounted) {
          setProject(projectData);
        }
      } catch (error) {
         if (isMounted) {
            showNotification({
                type: 'error',
                message: 'Erro ao carregar o projeto. Tente novamente.'
            });
            setTimeout(() => {
                if (isMounted) navigation.goBack();
            }, 1500);
         }
      } finally {
        if (isMounted) setLoadingProject(false);
      }
    };

    loadInitialData();
    fetchTasks(0, true);

    return () => { isMounted = false; };

  }, [projectId, navigation, showNotification, fetchTasks]);

  const handleUpdateProject = async (data: { title: string; description: string }) => {
    if (!project) return;

    try {
      const updatedProject = await projectService.updateProject(project.id, data);
      setProject(updatedProject);
      setEditModalVisible(false);
      showNotification({ type: 'success', message: 'Projeto atualizado com sucesso!' });
    } catch (error) {
      showNotification({
        type: 'error',
        message: getErrorMessage(error)
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
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
      setMembers(prev => prev.filter(m => m.userId !== selectedMember.userId));
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
    setProjectTasks(prev => [newTask, ...prev]);
  };

  const updateTaskInList = useCallback((taskId: number, updates: Partial<ProjectTask>) => {
    setProjectTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  const removeTaskFromList = useCallback((taskId: number) => {
    setProjectTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

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
    loadingTasks,
    refreshingTasks,
    initialLoadingTasks,
    handleRefreshTasks,
    handleLoadMoreTasks,
    addTaskLocally,
    updateTaskInList,
    removeTaskFromList,
    currentUserRole,
    isOwner,
    isAdmin,
    isEditModalVisible,
    setEditModalVisible,
    isConfirmDeleteVisible,
    setConfirmDeleteVisible,
    isEditMemberModalVisible,
    setEditMemberModalVisible,
    isInviteMemberModalVisible,
    setInviteMemberModalVisible,
    isConfirmRemoveMemberVisible,
    setConfirmRemoveMemberVisible,
    isConfirmLeaveVisible,
    setConfirmLeaveVisible,
    selectedMember,
    handleUpdateProject,
    handleDeleteProject,
    handleSelectMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleLeaveProject,
  };
}
// src/features/project/hooks/useProjectDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { projectService, ProjectDetails, UpdateProjectRequest } from '../services/projectService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { useNotification } from '../../../contexts/NotificationContext';
import { RootStackParamList } from '../../../types/navigation';
import { useProjectMembers } from './useProjectMembers';

type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

export function useProjectDetail() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailRouteProp>();
  const { projectId, projectRole } = route.params;
  const { showNotification } = useNotification();

  // States
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteMemberModalVisible, setInviteMemberModalVisible] = useState(false);
  const [isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' } | null>(null);

  // --- LÓGICA DE PERMISSÃO ---
  const currentUserRole = projectRole;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  // Usar o hook de membros
  const { members, setMembers, loadingMembers, refreshingMembers, handleRefresh, handleLoadMore } = useProjectMembers(projectId);

  // Carrega os dados do projeto
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoadingProject(true);
        const projectData = await projectService.getProjectById(projectId);
        setProject(projectData);
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Erro ao carregar o projeto. Tente novamente.'
        });
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } finally {
        setLoadingProject(false);
      }
    };

    loadProjectData();
  }, [projectId, navigation, showNotification]);

  // --- Project Actions ---
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

  // --- Member Actions ---
  const handleSelectMember = (member: { userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' }) => {
    if (!isAdmin) return;
    setSelectedMember(member);
    setEditMemberModalVisible(true);
  };

  const handleUpdateMemberRole = async (newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    if (!selectedMember) return;

    try {
      await projectService.updateMemberRole(projectId, selectedMember.userId, { newRole });

      // Atualiza apenas após o modal fechar
      setEditMemberModalVisible(false);

      // Recarrega a lista de membros para pegar dados atualizados
      handleRefresh();

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

  return {
    navigation,
    project,
    loadingProject,
    isDeleting,
    members,
    loadingMembers,
    refreshingMembers,
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
    selectedMember,
    handleRefresh,
    handleLoadMore,
    handleUpdateProject,
    handleDeleteProject,
    handleSelectMember,
    handleUpdateMemberRole,
    handleRemoveMember,
  };
}

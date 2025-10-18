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
  const { projectId } = route.params;
  const { showNotification } = useNotification();

  // States
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // Modal States
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [isInviteMemberModalVisible, setInviteMemberModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' } | null>(null);

  // Usar o hook de membros
  const { members, loadingMembers, refreshingMembers, handleRefresh, handleLoadMore } = useProjectMembers(projectId);

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

  const handleDeleteProject = () => {
    setConfirmDeleteVisible(false);
    setEditModalVisible(false);

    navigation.goBack();

    setTimeout(() => {
      showNotification({ type: 'success', message: 'Projeto excluído com sucesso!' });
    }, 500);
  };

  // --- Member Actions ---
  const handleSelectMember = (member: { userId: number; username: string; email: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' }) => {
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

  return {
    navigation,
    project,
    loadingProject,
    members,
    loadingMembers,
    refreshingMembers,
    currentUserRole: project?.projectRole,
    isEditModalVisible,
    setEditModalVisible,
    isConfirmDeleteVisible,
    setConfirmDeleteVisible,
    isEditMemberModalVisible,
    setEditMemberModalVisible,
    isInviteMemberModalVisible,
    setInviteMemberModalVisible,
    selectedMember,
    handleRefresh,
    handleLoadMore,
    handleUpdateProject,
    handleDeleteProject,
    handleSelectMember,
    handleUpdateMemberRole,
  };
}

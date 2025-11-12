import { useState, useRef } from 'react';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { projectService } from '../services/projectService';
import { getInviteErrorMessage, getErrorMessage } from '../../../utils/errorHandler';
import { isAxiosError } from 'axios'; 
import { ErrorCode } from '../../../types/api'; 
import { TeamType } from '../../../types/entities'; 

interface UseProjectScreenProps {
  addProject: (projectData: { title: string; description: string }) => Promise<any>;
}

export function useProjectScreen({ addProject }: UseProjectScreenProps) {
  const [isNewProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [isAddMembersModalVisible, setAddMembersModalVisible] = useState(false);
  const [newlyCreatedProject, setNewlyCreatedProject] = useState<any | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });

  const notificationRef = useRef<NotificationPopupRef>(null); 
  const modalNotificationRef = useRef<NotificationPopupRef | null>(null); 

 
  const handleCreateProjectAndProceed = async (data: { title: string; description: string }) => {
    setIsCreatingProject(true);
    try {
      // Chama a API para criar o projeto
      const createdProject = await addProject({
        title: data.title,
        description: data.description,
      });

      // Armazena o projeto recem criado
      setNewlyCreatedProject(createdProject);
      setNewProjectModalVisible(false); 
      setAddMembersModalVisible(true); 

      setTimeout(() => {
        modalNotificationRef.current?.show({ type: 'success', message: `Projeto "${data.title}" criado!` });
      }, 300);

    } catch (error: any) {
       const errorMessage = getErrorMessage(error);
       const isDuplicateError = isAxiosError(error) &&
            (error.response?.data?.errorCode === ErrorCode.PROJECT_TITLE_ALREADY_EXISTS ||
             error.response?.data?.errorCode === ErrorCode.RESOURCE_ALREADY_EXISTS); 

       if (isDuplicateError) {
           setInfoPopup({ visible: true, title: 'Erro ao Criar', message: errorMessage });
       } else {
           notificationRef.current?.show({ type: 'error', message: errorMessage });
       }
    } finally {
      setIsCreatingProject(false);
    }
  };

 
  const handleInviteMemberToProject = async (email: string, role: 'ADMIN' | 'MEMBER') => {
    if (!newlyCreatedProject) {
      modalNotificationRef.current?.show({ type: 'error', message: 'Projeto não encontrado.' });
      return;
    }

    setIsInvitingMember(true);
    try {
      await projectService.inviteUserByEmail(newlyCreatedProject.id, { email, role });
      modalNotificationRef.current?.show({ type: 'success', message: `Convite enviado com sucesso!` });
    } catch (error) {
      const errorMessage = getInviteErrorMessage(error);
      modalNotificationRef.current?.show({ type: 'error', message: errorMessage });
    } finally {
      setIsInvitingMember(false);
    }
  };

  const handleImportTeamToProject = async (teamId: string) => {
    if (!newlyCreatedProject) {
        modalNotificationRef.current?.show({ type: 'error', message: 'Projeto não encontrado.' });
        return;
    }
    if (!teamId) {
        modalNotificationRef.current?.show({ type: 'error', message: 'ID do time inválido.' });
        return;
    }

    setIsImporting(true);
    try {
      await projectService.importTeamMembers(newlyCreatedProject.id, teamId);
      modalNotificationRef.current?.show({ type: 'success', message: 'Membros importados com sucesso!' });
    } catch (error) {
       const errorMessage = getErrorMessage(error);
       modalNotificationRef.current?.show({ type: 'error', message: `Erro ao importar: ${errorMessage}` });
    } finally {
       setIsImporting(false);
    }
  };

 
  const handleCloseAddMembersModal = () => {
    setAddMembersModalVisible(false);
    setNewlyCreatedProject(null);
  };

  return {
    isNewProjectModalVisible,
    isAddMembersModalVisible,
    newlyCreatedProject,
    isCreatingProject,
    isInvitingMember,
    isImporting,
    infoPopup, 

    notificationRef, 
    modalNotificationRef, 

    setNewProjectModalVisible,
    setInfoPopup, 
    handleCreateProjectAndProceed,
    handleInviteMemberToProject,
    handleImportTeamToProject,
    handleCloseAddMembersModal,
  };
}
// src/features/project/hooks/useProjectScreen.ts
import { useState, useRef } from 'react';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { projectService } from '../services/projectService';
import { getInviteErrorMessage, getErrorMessage } from '../../../utils/errorHandler';
import { isAxiosError } from 'axios'; // Importar isAxiosError
import { ErrorCode } from '../../../types/api'; // Importar ErrorCode
import { TeamType } from '../../../types/entities'; // Mantido caso use em algum lugar

interface UseProjectScreenProps {
  addProject: (projectData: { title: string; description: string }) => Promise<any>;
}

export function useProjectScreen({ addProject }: UseProjectScreenProps) {
  // Estados dos modais
  const [isNewProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [isAddMembersModalVisible, setAddMembersModalVisible] = useState(false);

  // Estados do fluxo de criação
  const [newlyCreatedProject, setNewlyCreatedProject] = useState<any | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Estado para o InfoPopup de erro
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });

  // Refs para notificações
  const notificationRef = useRef<NotificationPopupRef>(null); // Para erros gerais
  const modalNotificationRef = useRef<NotificationPopupRef | null>(null); // Para sucesso/erros dentro dos modais de membros

  /**
   * Cria um projeto e procede para o modal de adicionar membros
   */
  const handleCreateProjectAndProceed = async (data: { title: string; description: string }) => {
    setIsCreatingProject(true);
    try {
      // Chama a API para criar o projeto
      const createdProject = await addProject({
        title: data.title,
        description: data.description,
      });

      // Armazena o projeto recém-criado
      setNewlyCreatedProject(createdProject);
      setNewProjectModalVisible(false); // Fecha modal de criação
      setAddMembersModalVisible(true); // Abre modal de adicionar membros

      // Mostra notificação de sucesso sobre o modal de membros
      setTimeout(() => {
        modalNotificationRef.current?.show({ type: 'success', message: `Projeto "${data.title}" criado!` });
      }, 300);

    } catch (error: any) {
       const errorMessage = getErrorMessage(error);
       // --- ALTERAÇÃO: Usar InfoPopup para erro de nome duplicado ---
       // Verifica se o erro é Axios e se o código é de recurso existente (genérico ou específico)
       const isDuplicateError = isAxiosError(error) &&
            (error.response?.data?.errorCode === ErrorCode.PROJECT_TITLE_ALREADY_EXISTS ||
             error.response?.data?.errorCode === ErrorCode.RESOURCE_ALREADY_EXISTS); // Checa ambos os códigos

       if (isDuplicateError) {
           // Mostra o InfoPopup para erro de nome duplicado
           setInfoPopup({ visible: true, title: 'Erro ao Criar', message: errorMessage });
       } else {
           // Para outros erros, usa a notificação flutuante na tela principal
           notificationRef.current?.show({ type: 'error', message: errorMessage });
       }
       // --- FIM DA ALTERAÇÃO ---
    } finally {
      setIsCreatingProject(false);
    }
  };

  /**
   * Convida um membro para o projeto recém-criado
   */
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

  /**
   * Importa membros de um time para o projeto
   */
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

  /**
   * Fecha o modal de adicionar membros e limpa o estado
   */
  const handleCloseAddMembersModal = () => {
    setAddMembersModalVisible(false);
    setNewlyCreatedProject(null);
  };

  return {
    // Estados
    isNewProjectModalVisible,
    isAddMembersModalVisible,
    newlyCreatedProject,
    isCreatingProject,
    isInvitingMember,
    isImporting,
    infoPopup, // Exportar estado do InfoPopup

    // Refs
    notificationRef, // Para erros gerais da tela
    modalNotificationRef, // Para modais de membros

    // Funções
    setNewProjectModalVisible,
    setInfoPopup, // Exportar setter do InfoPopup
    handleCreateProjectAndProceed,
    handleInviteMemberToProject,
    handleImportTeamToProject,
    handleCloseAddMembersModal,
  };
}
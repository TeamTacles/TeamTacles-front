// src/hooks/screen/useProjectScreen.ts
// Hook customizado para gerenciar o estado e lógica da tela de projetos

import { useState, useRef } from 'react';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { projectService } from '../services/projectService';
import { getInviteErrorMessage } from '../../../utils/errorHandler';
import { TeamType } from '../../../types/entities';

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

  // Fila de notificações
  const [notificationQueue, setNotificationQueue] = useState<string[]>([]);

  // Refs para notificações
  const notificationRef = useRef<NotificationPopupRef>(null);
  const modalNotificationRef = useRef<NotificationPopupRef | null>(null);

  /**
   * Cria um projeto e procede para o modal de adicionar membros
   */
  const handleCreateProjectAndProceed = async (data: { title: string; description: string }) => {
    if (!data.title.trim()) {
      notificationRef.current?.show({ type: 'error', message: 'O título do projeto é obrigatório.' });
      return;
    }

    setIsCreatingProject(true);
    try {
      // Chama a API para criar o projeto
      const createdProject = await addProject({
        title: data.title,
        description: data.description,
      });

      // Armazena o projeto recém-criado com o ID para usar nos convites
      setNewlyCreatedProject(createdProject);
      setNotificationQueue(prev => [`Projeto "${data.title}" criado!`, ...prev]);
      setNewProjectModalVisible(false);
      setAddMembersModalVisible(true);
    } catch (error: any) {
      const errorMessage = error.message || 'Não foi possível criar o projeto.';
      notificationRef.current?.show({ type: 'error', message: errorMessage });
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
      // Exibe notificação de sucesso imediatamente dentro do modal
      modalNotificationRef.current?.show({ type: 'success', message: `Convite enviado com sucesso!` });
    } catch (error) {
      // Exibe erro imediatamente dentro do modal (usa modalNotificationRef)
      const errorMessage = getInviteErrorMessage(error);
      modalNotificationRef.current?.show({ type: 'error', message: errorMessage });
    } finally {
      setIsInvitingMember(false);
    }
  };

  /**
   * Importa membros de um time para o projeto
   */
  const handleImportTeamToProject = (teamId: string) => {
    // TODO: Implementar importação de time quando o endpoint estiver disponível
    // await projectService.importTeam(newlyCreatedProject.id, teamId);
    setNotificationQueue(prev => [...prev, 'Membros importados com sucesso!']);
  };

  /**
   * Processa a fila de notificações sequencialmente
   */
  const processNotificationQueue = () => {
    if (notificationQueue.length === 0) return;

    // Pega a primeira mensagem da fila
    const message = notificationQueue[0];
    notificationRef.current?.show({ type: 'success', message });

    // Remove a mensagem que acabou de ser exibida
    const newQueue = notificationQueue.slice(1);
    setNotificationQueue(newQueue);

    // Se ainda houver mensagens, chama a função novamente após 3 segundos
    if (newQueue.length > 0) {
      setTimeout(processNotificationQueue, 3000); // 3s de intervalo para a próxima
    }
  };

  /**
   * Fecha o modal de adicionar membros e processa a fila de notificações
   */
  const handleCloseAddMembersModal = () => {
    setAddMembersModalVisible(false);
    // Inicia o processamento da fila SÓ QUANDO o modal for fechado
    if (notificationQueue.length > 0) {
      setTimeout(processNotificationQueue, 500); // Um pequeno atraso inicial para a animação de fechar o modal
    }
    setNewlyCreatedProject(null);
  };

  return {
    // Estados
    isNewProjectModalVisible,
    isAddMembersModalVisible,
    newlyCreatedProject,
    isCreatingProject,
    isInvitingMember,
    notificationQueue,

    // Refs
    notificationRef,
    modalNotificationRef,

    // Funções
    setNewProjectModalVisible,
    handleCreateProjectAndProceed,
    handleInviteMemberToProject,
    handleImportTeamToProject,
    handleCloseAddMembersModal,
  };
}

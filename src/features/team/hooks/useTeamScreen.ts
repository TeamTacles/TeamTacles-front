// src/hooks/screen/useTeamScreen.ts
// Hook customizado para gerenciar o estado e lógica da tela de times

import { useState, useRef } from 'react';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { TeamType } from '../../../types/entities';

export function useTeamScreen() {
  // Estados dos modais
  const [isNewTeamModalVisible, setNewTeamModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);

  // Estados do fluxo de criação
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState<TeamType | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Ref para notificações
  const notificationRef = useRef<NotificationPopupRef>(null);

  // Estado para InfoPopup (validação de formulário)
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });

  /**
   * Dados do usuário atual (mocado)
   */
  const userWithAvatar = { initials: 'CD', name: 'Caio Dib' };

  /**
   * Cria um time e procede para o modal de convite
   */
  const handleCreateTeamAndProceed = async (
    data: { title: string; description: string },
    setTeams: React.Dispatch<React.SetStateAction<TeamType[]>>
  ) => {
    if (!data.title.trim()) {
      setInfoPopup({ visible: true, title: 'Atenção', message: 'O título da equipe é obrigatório.' });
      return;
    }

    setIsCreatingTeam(true);
    try {
      console.log("Simulando chamada à API para criar a equipe:", data);
      const responseSimulada = { id: new Date().getTime(), name: data.title, description: data.description };

      const newTeam: TeamType = {
        id: responseSimulada.id.toString(),
        title: responseSimulada.name,
        description: responseSimulada.description,
        members: [{ name: userWithAvatar.name, initials: userWithAvatar.initials }],
        createdAt: new Date(),
      };

      setTeams(currentTeams => [newTeam, ...currentTeams]);
      setNewlyCreatedTeam(newTeam);
      setNewTeamModalVisible(false);
      setInviteModalVisible(true);
    } catch (error) {
      setInfoPopup({ visible: true, title: 'Erro na Criação', message: 'Não foi possível criar a equipe. Por favor, tente novamente mais tarde.' });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  /**
   * Convida um membro por e-mail para o time recém-criado
   */
  const handleInviteByEmail = (email: string, role: 'ADMIN' | 'MEMBER') => {
    if (!newlyCreatedTeam) return;
    console.log(`Simulando convite para ${email} na equipe ID ${newlyCreatedTeam.id} com cargo ${role}`);
    notificationRef.current?.show({ type: 'success', message: `Convite enviado para ${email}!` });
  };

  /**
   * Fecha o modal de convite e exibe notificação de sucesso
   */
  const handleCloseInviteModal = () => {
    setInviteModalVisible(false);
    if (newlyCreatedTeam) {
      const teamTitle = newlyCreatedTeam.title || newlyCreatedTeam.name || 'Equipe';
      notificationRef.current?.show({ type: 'success', message: `Equipe "${teamTitle}" criada com sucesso!` });
      setNewlyCreatedTeam(null);
    }
  };

  return {
    // Estados
    isNewTeamModalVisible,
    isInviteModalVisible,
    newlyCreatedTeam,
    isCreatingTeam,
    infoPopup,
    userWithAvatar,

    // Ref
    notificationRef,

    // Funções
    setNewTeamModalVisible,
    setInfoPopup,
    handleCreateTeamAndProceed,
    handleInviteByEmail,
    handleCloseInviteModal,
  };
}

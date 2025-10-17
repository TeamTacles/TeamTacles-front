// src/features/team/hooks/useTeamScreen.ts
import { useState, useEffect, useRef } from 'react';
import { TeamType } from '../../../types/entities';
import { teamService, CreateTeamRequest } from '../services/teamService';
import { getErrorMessage } from '../../../utils/errorHandler';
// --- INÍCIO DA CORREÇÃO ---
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
// --- FIM DA CORREÇÃO ---

export function useTeamScreen() {
  // --- INÍCIO DA CORREÇÃO: Remover o useNotification e criar a ref ---
  const modalNotificationRef = useRef<NotificationPopupRef>(null);
  // --- FIM DA CORREÇÃO ---
  
  // Estados dos modais
  const [isNewTeamModalVisible, setNewTeamModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);

  // Estados do fluxo de criação
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState<TeamType | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Estado para InfoPopup (validação de formulário)
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });

  const userWithAvatar = { initials: 'CD', name: 'Caio Dib' };

  // Efeito para mostrar a notificação após o modal de convite estar visível
  useEffect(() => {
    if (isInviteModalVisible && newlyCreatedTeam) {
        setTimeout(() => {
            const teamTitle = newlyCreatedTeam.title || newlyCreatedTeam.name || 'Equipe';
            // --- INÍCIO DA CORREÇÃO: Usar a ref do modal ---
            modalNotificationRef.current?.show({ type: 'success', message: `Equipe "${teamTitle}" criada com sucesso!` });
            // --- FIM DA CORREÇÃO ---
        }, 300);
    }
  }, [isInviteModalVisible, newlyCreatedTeam]);


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
      const apiData: CreateTeamRequest = {
        name: data.title,
        description: data.description,
      };

      const createdTeamFromApi = await teamService.createTeam(apiData);

      const newTeam: TeamType = {
        id: createdTeamFromApi.id,
        title: createdTeamFromApi.name,
        description: createdTeamFromApi.description,
        members: [{ name: userWithAvatar.name, initials: userWithAvatar.initials }],
        createdAt: new Date(),
        teamRole: 'OWNER',
      };

      setTeams(currentTeams => [newTeam, ...currentTeams]);
      setNewlyCreatedTeam(newTeam);
      
      setNewTeamModalVisible(false);
      setInviteModalVisible(true);

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setInfoPopup({ visible: true, title: 'Erro na Criação', message: errorMessage });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleCloseInviteModal = () => {
    setInviteModalVisible(false);
    setNewlyCreatedTeam(null);
  };

  return {
    isNewTeamModalVisible,
    isInviteModalVisible,
    newlyCreatedTeam,
    isCreatingTeam,
    infoPopup,
    userWithAvatar,
    // --- INÍCIO DA CORREÇÃO: Exportar a ref ---
    modalNotificationRef,
    // --- FIM DA CORREÇÃO ---
    setNewTeamModalVisible,
    setInfoPopup,
    handleCreateTeamAndProceed,
    handleCloseInviteModal,
  };
}
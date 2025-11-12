import { useState, useEffect, useRef } from 'react';
import { TeamType } from '../../../types/entities';
import { teamService, CreateTeamRequest } from '../services/teamService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { useAppContext } from '../../../contexts/AppContext';

export function useTeamScreen() {
  const modalNotificationRef = useRef<NotificationPopupRef>(null);
  const { user } = useAppContext(); 

  const [isNewTeamModalVisible, setNewTeamModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState<TeamType | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    if (isInviteModalVisible && newlyCreatedTeam) {
        setTimeout(() => {
            const teamTitle = newlyCreatedTeam.title || newlyCreatedTeam.name || 'Equipe';
            modalNotificationRef.current?.show({ type: 'success', message: `Equipe "${teamTitle}" criada com sucesso!` });
        }, 300);
    }
  }, [isInviteModalVisible, newlyCreatedTeam]);


  const handleCreateTeamAndProceed = async (
    data: { title: string; description: string },
    setTeams: React.Dispatch<React.SetStateAction<TeamType[]>>
  ) => {
    // Verifica se os dados do usuário foram carregados
    if (!user) {
      setInfoPopup({ visible: true, title: 'Erro', message: 'Dados do usuário não carregados. Tente novamente.' });
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
        // Usa os dados dinâmicos do usuário do contexto
        members: [{ name: user.name, initials: user.initials }],
        createdAt: new Date(),
        teamRole: 'OWNER',
        memberCount: 1,
        // Usa os dados dinâmicos do usuário do contexto
        memberNames: [user.name],
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
    modalNotificationRef,
    setNewTeamModalVisible,
    setInfoPopup,
    handleCreateTeamAndProceed,
    handleCloseInviteModal,
  };
}
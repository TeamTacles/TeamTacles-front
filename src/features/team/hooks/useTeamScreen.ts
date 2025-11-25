import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamType } from '../../../types/entities';
import { teamService, CreateTeamRequest } from '../services/teamService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { useAppContext } from '../../../contexts/AppContext';

export function useTeamScreen() {
  const modalNotificationRef = useRef<NotificationPopupRef>(null);
  const { user } = useAppContext();
  const queryClient = useQueryClient(); 

  const [isNewTeamModalVisible, setNewTeamModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState<TeamType | null>(null);
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    if (isInviteModalVisible && newlyCreatedTeam) {
        setTimeout(() => {
            const teamTitle = newlyCreatedTeam.title || newlyCreatedTeam.name || 'Equipe';
            modalNotificationRef.current?.show({ type: 'success', message: `Equipe "${teamTitle}" criada com sucesso!` });
        }, 300);
    }
  }, [isInviteModalVisible, newlyCreatedTeam]);

  const createTeamMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!user) throw new Error('Dados do usuário não carregados.');

      const apiData: CreateTeamRequest = {
        name: data.title,
        description: data.description,
      };

      const createdTeamFromApi = await teamService.createTeam(apiData);

      const newTeam: TeamType = {
        id: createdTeamFromApi.id,
        title: createdTeamFromApi.name,
        description: createdTeamFromApi.description,
        members: [{ name: user.name, initials: user.initials }],
        createdAt: new Date().toISOString(),
        teamRole: 'OWNER',
        memberCount: 1,
        memberNames: [user.name],
      };

      return newTeam;
    },
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });

      setNewlyCreatedTeam(newTeam);
      setNewTeamModalVisible(false);
      setInviteModalVisible(true);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setInfoPopup({ visible: true, title: 'Erro na Criação', message: errorMessage });
    }
  });

  const handleCreateTeamAndProceed = (data: { title: string; description: string }) => {
    createTeamMutation.mutate(data);
  };

  const handleCloseInviteModal = () => {
    setInviteModalVisible(false);
    setNewlyCreatedTeam(null);
  };

  return {
    isNewTeamModalVisible,
    isInviteModalVisible,
    newlyCreatedTeam,
    
    isCreatingTeam: createTeamMutation.isPending,
    
    infoPopup,
    modalNotificationRef,
    setNewTeamModalVisible,
    setInfoPopup,
    handleCreateTeamAndProceed, 
    handleCloseInviteModal,
  };
}
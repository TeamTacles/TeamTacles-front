import { useState } from 'react';
import { Team } from '../../../types/entities';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  // Adicione aqui funções para gerenciar teams quando precisar
  // Ex: addTeam, loadTeams, refreshTeams, etc.

  return {
    teams,
  };
}

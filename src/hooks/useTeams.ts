import { useState } from 'react';

// Representa um membro simplificado
interface Member {
  name: string;
  initials: string;
}

// Baseado em UserTeamResponseDTO e TeamResponseDTO
export interface Team {
  id: number;
  name: string; // DTO usa 'name', não 'title'
  description: string;
  teamRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: Member[];
  createdAt: number;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  // Adicione aqui funções para gerenciar teams quando precisar
  // Ex: addTeam, loadTeams, refreshTeams, etc.

  return {
    teams,
  };
}

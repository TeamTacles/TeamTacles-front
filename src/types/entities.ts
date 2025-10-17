// src/types/entities.ts
// Tipos centralizados de entidades de negócio do TeamTacles

/**
 * Representa um membro simplificado para exibição nos cards
 */
export interface Member {
  name: string;
  initials: string;
}

/**
 * Representa um membro com detalhes completos para a tela de detalhes
 */
export interface TeamMemberDetail {
  userId: number;
  username: string;
  email: string;
  teamRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

/**
 * Representa um projeto baseado em UserProjectResponseDTO e ProjectResponseDTO
 */
export interface Project {
  id: number;
  title: string;
  description: string;
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  teamMembers: Member[];
  createdAt: number;
}

/**
 * Representa uma tarefa baseada em TaskResponseDTO
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string; // OffsetDateTime vira string
  projectId: number;
  projectName: string; // Campo de conveniência para o front-end
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  createdAt: number; // OffsetDateTime vira timestamp
}

/**
 * Representa um time baseado em UserTeamResponseDTO e TeamResponseDTO
 */
export interface Team {
  id: number | string; // Aceita ambos para compatibilidade com mocks
  name?: string; // DTO usa 'name'
  title?: string; // Alguns componentes usam 'title'
  description: string;
  teamRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: Member[];
  createdAt: Date | number; // Aceita ambos para compatibilidade
  memberCount: number; // NOVO CAMPO
  memberNames: string[]; // NOVO CAMPO
}

/**
 * Alias para compatibilidade retroativa com componentes existentes
 */
export type TeamType = Team;
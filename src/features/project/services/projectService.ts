// src/features/project/services/projectService.ts
import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';

// --- TIPOS (Baseados nos seus DTOs em Java) ---

// Baseado em ProjectResponseDTO.java
export interface ProjectDetails {
  id: number;
  title: string;
  description: string;
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// Baseado em ProjectMemberResponseDTO.java
export interface ProjectMember {
  userId: number;
  username: string;
  email: string;
  projectRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// Baseado em TaskResponseDTO.java
export interface ProjectTask {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string; // A API retorna OffsetDateTime, que chegará como string
  ownerId: number;
  assignments: {
    userId: number;
    username: string;
  }[];
}

// --- FUNÇÕES DE API ---

// Busca todos os projetos do usuário autenticado (paginado)
const getProjects = async (page = 0, size = 20): Promise<PagedResponse<ProjectDetails>> => {
  const response = await api.get<PagedResponse<ProjectDetails>>(`/project?page=${page}&size=${size}`);
  return response.data;
};

// Busca os detalhes do projeto
const getProjectById = async (projectId: number): Promise<ProjectDetails> => {
  const response = await api.get<ProjectDetails>(`/project/${projectId}`);
  return response.data;
};

// Busca os membros do projeto (com paginação)
const getProjectMembers = async (projectId: number, page = 0, size = 20): Promise<PagedResponse<ProjectMember>> => {
  const response = await api.get<PagedResponse<ProjectMember>>(`/project/${projectId}/members?page=${page}&size=${size}`);
  return response.data;
};

// Busca as tarefas do projeto
const getProjectTasks = async (projectId: number): Promise<PagedResponse<ProjectTask>> => {
  const response = await api.get<PagedResponse<ProjectTask>>(`/project/${projectId}/tasks`);
  return response.data;
};

// --- CRIAÇÃO DE PROJETO ---

export interface CreateProjectRequest {
  title: string;
  description: string;
}

const createProject = async (projectData: CreateProjectRequest): Promise<ProjectDetails> => {
  const response = await api.post<ProjectDetails>('/project', projectData);
  return response.data;
};

// --- ATUALIZAÇÃO DE PROJETO ---

export interface UpdateProjectRequest {
  title: string;
  description: string;
}

const updateProject = async (projectId: number, projectData: UpdateProjectRequest): Promise<ProjectDetails> => {
  const response = await api.patch<ProjectDetails>(`/project/${projectId}`, projectData);
  return response.data;
};

// --- CONVITE DE MEMBROS POR EMAIL ---

export interface InviteByEmailRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

const inviteUserByEmail = async (projectId: number, inviteData: InviteByEmailRequest): Promise<void> => {
  await api.post(`/project/${projectId}/invite-email`, inviteData);
};

// --- ATUALIZAÇÃO DE ROLE DE MEMBRO ---

export interface UpdateMemberRoleRequest {
  newRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

const updateMemberRole = async (projectId: number, userId: number, data: UpdateMemberRoleRequest): Promise<ProjectMember> => {
  const response = await api.patch<ProjectMember>(`/project/${projectId}/member/${userId}/role`, data);
  return response.data;
};

// --- REMOÇÃO DE MEMBRO ---

const removeMember = async (projectId: number, userId: number): Promise<void> => {
  await api.delete(`/project/${projectId}/member/${userId}`);
};

export const projectService = {
  getProjects,
  getProjectById,
  getProjectMembers,
  getProjectTasks,
  createProject,
  updateProject,
  inviteUserByEmail,
  updateMemberRole,
  removeMember,
};
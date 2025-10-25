// src/features/project/services/projectService.ts
import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';
// --- INÍCIO DA ALTERAÇÃO ---
import { Filters } from '../../task/components/FilterModal'; // Importar tipo Filters
// --- FIM DA ALTERAÇÃO ---

// --- TIPOS (Baseados nos seus DTOs em Java) ---

// Baseado em ProjectResponseDTO.java
export interface ProjectDetails {
  id: number;
  title: string;
  description: string;
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER'; // Mantido opcional por segurança
}

// Baseado em ProjectMemberResponseDTO.java
export interface ProjectMember {
  userId: number;
  username: string;
  email: string;
  projectRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// Baseado em TaskResponseDTO.java (ajustado para corresponder ao backend)
export interface ProjectTask {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'; // Renomeado de taskStatus para status
  dueDate: string; // A API retorna OffsetDateTime, que chegará como string
  ownerId: number;
  assignments: {
    userId: number;
    username: string;
    // taskRole?: 'OWNER' | 'ASSIGNEE'; // O backend pode não retornar taskRole aqui, verificar
  }[];
  projectId: number; // Adicionado projectId se a API retornar
  createdAt?: string; // Adicionado createdAt se a API retornar
}


// Resposta do Link de Convite
export interface InviteLinkResponse {
    inviteLink: string;
    expiresAt: string; // Ou Date, dependendo de como você quer tratar
}


// --- FUNÇÕES DE API ---

// --- INÍCIO DA ALTERAÇÃO ---
const formatDateForApi = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  // Formato YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

// Busca todos os projetos do usuário autenticado (paginado e filtrado)
const getProjects = async (page = 0, size = 20, filters: Filters = {}, title: string = ''): Promise<PagedResponse<ProjectDetails>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (title) params.append('title', title); // Adiciona filtro de título se houver

  // Adiciona filtros de data se existirem
  const createdAtAfter = formatDateForApi(filters.createdAtAfter);
  if (createdAtAfter) params.append('createdAtAfter', createdAtAfter);

  const createdAtBefore = formatDateForApi(filters.createdAtBefore);
  if (createdAtBefore) params.append('createdAtBefore', createdAtBefore);

  // Faz a requisição com os parâmetros
  const response = await api.get<PagedResponse<ProjectDetails>>(`/project?${params.toString()}`);
  return response.data;
};
// --- FIM DA ALTERAÇÃO ---

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

// Busca as tarefas do projeto (COM PAGINAÇÃO)
const getProjectTasks = async (projectId: number, page = 0, size = 10): Promise<PagedResponse<ProjectTask>> => {
  const response = await api.get<PagedResponse<ProjectTask>>(`/project/${projectId}/tasks?page=${page}&size=${size}`); // Adiciona paginação
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

// --- IMPORTAR MEMBROS DO TIME ---
const importTeamMembers = async (projectId: number, teamId: number | string): Promise<void> => {
    await api.post(`/project/${projectId}/import-team/${teamId}`);
};

// --- GERAR LINK DE CONVITE ---
const generateInviteLink = async (projectId: number): Promise<InviteLinkResponse> => {
    const response = await api.post<InviteLinkResponse>(`/project/${projectId}/invite-link`);
    return response.data;
};

// --- DELETAR PROJETO ---
const deleteProject = async (projectId: number | string): Promise<void> => {
    await api.delete(`/project/${projectId}`);
};

// --- SAIR DO PROJETO ---
const leaveProject = async (projectId: number | string): Promise<void> => {
    await api.delete(`/project/${projectId}/leave`);
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
  importTeamMembers,
  generateInviteLink,
  deleteProject,
  leaveProject,
};
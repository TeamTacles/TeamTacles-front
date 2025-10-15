// src/services/projectService.ts
import api from './api';
import { PagedResponse } from '../types/PagedResponse'; // Precisaremos criar este tipo genérico

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

// Busca os membros do projeto
const getProjectMembers = async (projectId: number): Promise<PagedResponse<ProjectMember>> => {
  const response = await api.get<PagedResponse<ProjectMember>>(`/project/${projectId}/members`);
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

export const projectService = {
  getProjects,
  getProjectById,
  getProjectMembers,
  getProjectTasks,
  createProject,
};
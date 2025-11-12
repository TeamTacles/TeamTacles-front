import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';
import { Filters } from '../../task/components/FilterModal';


export interface ProjectDetails {
  id: number;
  title: string;
  description: string;
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface ProjectMember {
  userId: number;
  username: string;
  email: string;
  projectRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface ProjectTask {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
  dueDate: string;
  ownerId: number;
  assignments: {
    userId: number;
    username: string;
  }[];
  projectId: number;
  createdAt?: string;
}


export interface InviteLinkResponse {
    inviteLink: string;
  expiresAt: string;
}
const formatDateForApi = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
};

const getProjects = async (page = 0, size = 20, filters: Filters = {}, title: string = ''): Promise<PagedResponse<ProjectDetails>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (title) params.append('title', title);

  const createdAtAfter = formatDateForApi(filters.createdAtAfter);
  if (createdAtAfter) params.append('createdAtAfter', createdAtAfter);

  const createdAtBefore = formatDateForApi(filters.createdAtBefore);
  if (createdAtBefore) params.append('createdAtBefore', createdAtBefore);
  const response = await api.get<PagedResponse<ProjectDetails>>(`/project?${params.toString()}`);
  return response.data;
};

const getProjectById = async (projectId: number): Promise<ProjectDetails> => {
  const response = await api.get<ProjectDetails>(`/project/${projectId}`);
  return response.data;
};

const getProjectMembers = async (projectId: number, page = 0, size = 20): Promise<PagedResponse<ProjectMember>> => {
  const response = await api.get<PagedResponse<ProjectMember>>(`/project/${projectId}/members?page=${page}&size=${size}`);
  return response.data;
};

const getProjectTasks = async (projectId: number, page = 0, size = 10): Promise<PagedResponse<ProjectTask>> => {
  const response = await api.get<PagedResponse<ProjectTask>>(`/project/${projectId}/tasks?page=${page}&size=${size}`);
  return response.data;
};
export interface CreateProjectRequest {
  title: string;
  description: string;
}

const createProject = async (projectData: CreateProjectRequest): Promise<ProjectDetails> => {
  const response = await api.post<ProjectDetails>('/project', projectData);
  return response.data;
};

export interface UpdateProjectRequest {
  title: string;
  description: string;
}

const updateProject = async (projectId: number, projectData: UpdateProjectRequest): Promise<ProjectDetails> => {
  const response = await api.patch<ProjectDetails>(`/project/${projectId}`, projectData);
  return response.data;
};

export interface InviteByEmailRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

const inviteUserByEmail = async (projectId: number, inviteData: InviteByEmailRequest): Promise<void> => {
  await api.post(`/project/${projectId}/invite-email`, inviteData);
};

export interface UpdateMemberRoleRequest {
  newRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

const updateMemberRole = async (projectId: number, userId: number, data: UpdateMemberRoleRequest): Promise<ProjectMember> => {
  const response = await api.patch<ProjectMember>(`/project/${projectId}/member/${userId}/role`, data);
  return response.data;
};
 
const removeMember = async (projectId: number, userId: number): Promise<void> => {
  await api.delete(`/project/${projectId}/member/${userId}`);
};

const importTeamMembers = async (projectId: number, teamId: number | string): Promise<void> => {
  await api.post(`/project/${projectId}/import-team/${teamId}`);
};

const generateInviteLink = async (projectId: number): Promise<InviteLinkResponse> => {
  const response = await api.post<InviteLinkResponse>(`/project/${projectId}/invite-link`);
  return response.data;
};

const deleteProject = async (projectId: number | string): Promise<void> => {
  await api.delete(`/project/${projectId}`);
};

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
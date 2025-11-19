import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';
import { Team, TeamMemberDetail } from '../../../types/entities';
import { Filters } from '../../task/components/FilterModal';
export interface CreateTeamRequest {
  name: string;
  description: string;
}

export interface UpdateTeamRequest {
  name: string;
  description: string;
}

export interface InviteByEmailRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface InviteLinkResponse {
  inviteToken: string;
  expiresAt: string;
}

export interface UpdateMemberRoleRequest {
    newRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}


const formatDateForApi = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
};

const getTeams = async (page = 0, size = 20, filters: Filters = {}, name: string = ''): Promise<PagedResponse<Team>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (name) params.append('name', name);
  const createdAtAfter = formatDateForApi(filters.createdAtAfter);
  if (createdAtAfter) params.append('createdAtAfter', createdAtAfter);
  const createdAtBefore = formatDateForApi(filters.createdAtBefore);
  if (createdAtBefore) params.append('createdAtBefore', createdAtBefore);

  const response = await api.get<PagedResponse<Team>>(`/team?${params.toString()}`);
  return response.data;
};

const createTeam = async (teamData: CreateTeamRequest): Promise<Team> => {
  const response = await api.post<Team>('/team', teamData);
  return response.data;
};

const inviteUserByEmail = async (teamId: number | string, inviteData: InviteByEmailRequest): Promise<void> => {
  await api.post(`/team/${teamId}/invite-email`, inviteData);
};

const generateInviteLink = async (teamId: number | string): Promise<InviteLinkResponse> => {
  const response = await api.post<InviteLinkResponse>(`/team/${teamId}/invite-link`);
  return response.data;
};

const getTeamById = async (teamId: number | string): Promise<Team> => {
    const response = await api.get<Team>(`/team/${teamId}`);
    return response.data;
};

const getTeamMembers = async (teamId: number | string, page = 0, size = 10): Promise<PagedResponse<TeamMemberDetail>> => {
    const response = await api.get<PagedResponse<TeamMemberDetail>>(`/team/${teamId}/members?page=${page}&size=${size}`);
    return response.data;
};

const updateTeam = async (teamId: number | string, data: UpdateTeamRequest): Promise<Team> => {
    const response = await api.patch<Team>(`/team/${teamId}`, data);
    return response.data;
};

const deleteTeam = async (teamId: number | string): Promise<void> => {
    await api.delete(`/team/${teamId}`);
};

const updateMemberRole = async (teamId: number | string, userId: number, data: UpdateMemberRoleRequest): Promise<TeamMemberDetail> => {
    const response = await api.patch<TeamMemberDetail>(`/team/${teamId}/member/${userId}/role`, data);
    return response.data;
};

const removeMember = async (teamId: number | string, userId: number): Promise<void> => {
    await api.delete(`/team/${teamId}/member/${userId}`);
};

const leaveTeam = async (teamId: number | string): Promise<void> => {
    await api.delete(`/team/${teamId}/leave`);
};

const joinTeamWithLink = async (token: string): Promise<TeamMemberDetail> => {
  const response = await api.post<TeamMemberDetail>(`/team/join?token=${token}`);
  return response.data;
};

export const teamService = {
  getTeams,
  createTeam,
  inviteUserByEmail,
  generateInviteLink,
  getTeamById,
  getTeamMembers,
  updateTeam,
  deleteTeam,
  updateMemberRole,
  removeMember,
  leaveTeam,
  joinTeamWithLink,
};
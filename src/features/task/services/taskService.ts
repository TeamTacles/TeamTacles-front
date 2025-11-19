import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';
import { Task } from '../../../types/entities';
import { Filters } from '../components/FilterModal';

export interface UserTaskApiResponse {
  id: number;
  title: string;
  description: string;
  taskStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
  dueDate: string; 
  project: {
    id: number;
    title: string;
    description?: string;
  };
  createdAt?: string; 
}


export interface TaskDetailsApiResponse {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
  createdAt: string; 
  dueDate: string; 
  projectId: number;
  ownerId: number;
  completionComment?: string;
  completedAt?: string; 
  assignments: {
    userId: number;
    username: string;
    taskRole: 'OWNER' | 'ASSIGNEE'; 
  }[];
}

export interface UpdateTaskStatusRequest {
    newStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    completionComment?: string;
}

export interface TaskUpdateStatusResponse {
    id: number;
    title: string;
    description: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    createdAt: string; 
    dueDate: string; 
    completedAt?: string; 
    completionComment?: string;
}


export interface TaskRequestUpdate {
    title?: string;
    description?: string;
    dueDate?: string; 
}

export interface TaskAssignmentRequest {
    userId: number;
    taskRole: 'ASSIGNEE'; 
}

export interface TaskAssignmentsBulkDeleteRequest {
    userIds: number[];
}

export interface TaskCreateResponse {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; 
  createdAt: string;
  dueDate: string;
  projectId: number;
  ownerId: number;
  assignments: {
    userId: number;
    username: string;
    taskRole: string; 
  }[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string; 
}


const formatDateForApi = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0]; 
};

const getMyTasks = async (
  page = 0,
  size = 20,
  filters: Filters = {},
  title: string = ''
): Promise<PagedResponse<UserTaskApiResponse>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (title) params.append('title', title);
  
  if (filters.status) {
      if (filters.status === 'OVERDUE') {
          params.append('isOverdue', 'true');
      } else {
          params.append('status', filters.status);
      }
  }

  const createdAtAfter = formatDateForApi(filters.createdAtAfter);
  if (createdAtAfter) params.append('createdAtAfter', createdAtAfter);

  const createdAtBefore = formatDateForApi(filters.createdAtBefore);
  if (createdAtBefore) params.append('createdAtBefore', createdAtBefore);

  const dueDateAfter = formatDateForApi(filters.dueDateAfter);
  if (dueDateAfter) params.append('dueDateAfter', dueDateAfter);

  const dueDateBefore = formatDateForApi(filters.dueDateBefore);
  if (dueDateBefore) params.append('dueDateBefore', dueDateBefore);


  const response = await api.get<PagedResponse<UserTaskApiResponse>>(`/tasks?${params.toString()}`);
  return response.data;
};


const createTask = async (projectId: number, taskData: CreateTaskRequest): Promise<TaskCreateResponse> => {
  const response = await api.post<TaskCreateResponse>(`/project/${projectId}/tasks`, taskData);
  return response.data;
};


const getTaskById = async (projectId: number, taskId: number): Promise<TaskDetailsApiResponse> => {
    const response = await api.get<TaskDetailsApiResponse>(`/project/${projectId}/tasks/${taskId}`);
    return response.data;
};

const updateTaskStatus = async (
    projectId: number,
    taskId: number,
    data: UpdateTaskStatusRequest
): Promise<TaskUpdateStatusResponse> => {
    const response = await api.patch<TaskUpdateStatusResponse>(`/project/${projectId}/tasks/${taskId}/status`, data);
    return response.data;
};

const updateTaskDetails = async (
    projectId: number,
    taskId: number,
    data: TaskRequestUpdate
): Promise<TaskDetailsApiResponse> => {
    const response = await api.patch<TaskDetailsApiResponse>(`/project/${projectId}/tasks/${taskId}`, data);
    return response.data;
};

const deleteTask = async (projectId: number, taskId: number): Promise<void> => {
    await api.delete(`/project/${projectId}/tasks/${taskId}`);
};

const assignUsersToTask = async (
    projectId: number,
    taskId: number,
    assignments: TaskAssignmentRequest[] 
): Promise<TaskDetailsApiResponse> => {
    const response = await api.post<TaskDetailsApiResponse>(`/project/${projectId}/tasks/${taskId}/assignments`, assignments);
    return response.data;
};

const removeAssignees = async (
    projectId: number,
    taskId: number,
    data: TaskAssignmentsBulkDeleteRequest
): Promise<void> => {
    await api.delete(`/project/${projectId}/tasks/${taskId}/assignments`, { data: data });
};

const leaveTask = async (projectId: number, taskId: number): Promise<void> => {
    await api.delete(`/project/${projectId}/tasks/${taskId}/leave`);
};

export const taskService = {
  getMyTasks,
  createTask,
  getTaskById,
  updateTaskStatus,
  updateTaskDetails,
  deleteTask,
  assignUsersToTask,
  removeAssignees,
  leaveTask,
};

export interface TaskFilterReportDTO {
    title?: string;
    taskStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
    assignedUserId?: number;
    updatedAtAfter?: string;
    updatedAtBefore?: string;
    dueDateAfter?: string;
    dueDateBefore?: string;
    createdAtAfter?: string;
    createdAtBefore?: string;
    conclusionDateAfter?: string;
    conclusionDateBefore?: string;
    isOverdue?: boolean;
}
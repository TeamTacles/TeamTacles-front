// src/features/task/services/taskService.ts
import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';
// Usaremos o tipo Task de entities.ts
import { Task } from '../../../types/entities';
// Importar Filters
import { Filters } from '../components/FilterModal';

// Interface para mapear o DTO do backend (GET /tasks - lista de tarefas do usuário)
export interface UserTaskApiResponse {
  id: number;
  title: string;
  description: string;
  taskStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string; // Vem como string da API (OffsetDateTime)
  project: {
    id: number;
    title: string;
    description?: string; // Opcional, pois pode não vir sempre
  };
  createdAt?: string; // Adicionar createdAt se a API retornar
}

// --- INÍCIO: NOVAS INTERFACES E TIPOS ---

// Baseado em TaskResponseDTO.java (GET /project/{projectId}/tasks/{taskId})
export interface TaskDetailsApiResponse {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string; // OffsetDateTime
  dueDate: string; // OffsetDateTime
  projectId: number;
  ownerId: number;
  completionComment?: string; // Adicionado
  completedAt?: string; // Adicionado OffsetDateTime
  assignments: {
    userId: number;
    username: string;
    taskRole: 'OWNER' | 'ASSIGNEE'; // Vem do backend
  }[];
}

// Baseado em UpdateTaskStatusRequestDTO.java (PATCH /status)
export interface UpdateTaskStatusRequest {
    newStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    completionComment?: string;
}

// Baseado em TaskUpdateStatusResponseDTO.java (Resposta do PATCH /status)
export interface TaskUpdateStatusResponse {
    id: number;
    title: string;
    description: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    createdAt: string; // OffsetDateTime
    dueDate: string; // OffsetDateTime
    completedAt?: string; // OffsetDateTime
    completionComment?: string;
}


// Baseado em TaskRequestUpdateDTO.java (PATCH /taskId)
export interface TaskRequestUpdate {
    title?: string;
    description?: string;
    dueDate?: string; // Formato ISO 8601 com offset
}

// Baseado em TaskAssignmentRequestDTO.java (POST /assignments)
export interface TaskAssignmentRequest {
    userId: number;
    taskRole: 'ASSIGNEE'; // OWNER não pode ser atribuído aqui
}

// Baseado em TaskAssignmentsBulkDeleteRequestDTO.java (DELETE /assignments)
export interface TaskAssignmentsBulkDeleteRequest {
    userIds: number[];
}


// --- FIM: NOVAS INTERFACES E TIPOS ---


// Interface para a resposta do POST /project/{projectId}/tasks
export interface TaskCreateResponse {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; // Backend retorna "status", não "taskStatus"
  createdAt: string;
  dueDate: string;
  projectId: number;
  ownerId: number;
  assignments: {
    userId: number;
    username: string;
    taskRole: string; // "OWNER" para o criador
  }[];
}

// Interface para criar uma nova task (POST request body)
export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string; // Formato ISO 8601 com offset: "YYYY-MM-DDTHH:mm:ss±HH:mm"
}


// Função auxiliar para formatar datas apenas com data (YYYY-MM-DD) - usado em filtros
const formatDateForApi = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

// Função auxiliar para formatar data/hora com offset timezone (ISO 8601 completo)
// Retorna formato: "YYYY-MM-DDTHH:mm:ss±HH:mm"
// Exemplo: "2025-09-25T18:00:00-03:00"
export const formatDateTimeWithOffset = (date: Date): string => {
  // Obtém o offset do timezone em minutos
  const offsetMinutes = date.getTimezoneOffset();

  // Converte o offset para horas e minutos (com sinal invertido)
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const offsetSign = offsetMinutes <= 0 ? '+' : '-'; // Inverte sinal porque getTimezoneOffset retorna invertido

  // Formata o offset: ±HH:mm
  const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

  // Formata a data e hora: YYYY-MM-DDTHH:mm:ss
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
};

// Função para buscar as tarefas do usuário com filtros e paginação
const getMyTasks = async (
  page = 0,
  size = 20,
  filters: Filters = {},
  title: string = ''
): Promise<PagedResponse<UserTaskApiResponse>> => {
  // Monta os parâmetros da query
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  // Adiciona filtros
  if (title) params.append('title', title);
  if (filters.status) params.append('status', filters.status);

  const createdAtAfter = formatDateForApi(filters.createdAtAfter);
  if (createdAtAfter) params.append('createdAtAfter', createdAtAfter);

  const createdAtBefore = formatDateForApi(filters.createdAtBefore);
  if (createdAtBefore) params.append('createdAtBefore', createdAtBefore);


  const response = await api.get<PagedResponse<UserTaskApiResponse>>(`/tasks?${params.toString()}`);
  return response.data;
};


// Função para criar uma nova task em um projeto
const createTask = async (projectId: number, taskData: CreateTaskRequest): Promise<TaskCreateResponse> => {
  const response = await api.post<TaskCreateResponse>(`/project/${projectId}/tasks`, taskData);
  return response.data;
};

// --- INÍCIO: NOVAS FUNÇÕES ---

// Busca detalhes de uma task específica
const getTaskById = async (projectId: number, taskId: number): Promise<TaskDetailsApiResponse> => {
    const response = await api.get<TaskDetailsApiResponse>(`/project/${projectId}/tasks/${taskId}`);
    return response.data;
};

// Atualiza o status de uma task
const updateTaskStatus = async (
    projectId: number,
    taskId: number,
    data: UpdateTaskStatusRequest
): Promise<TaskUpdateStatusResponse> => {
    const response = await api.patch<TaskUpdateStatusResponse>(`/project/${projectId}/tasks/${taskId}/status`, data);
    return response.data;
};

// Atualiza detalhes de uma task (título, descrição, prazo)
const updateTaskDetails = async (
    projectId: number,
    taskId: number,
    data: TaskRequestUpdate
): Promise<TaskDetailsApiResponse> => {
    const response = await api.patch<TaskDetailsApiResponse>(`/project/${projectId}/tasks/${taskId}`, data);
    return response.data;
};

// Deleta uma task
const deleteTask = async (projectId: number, taskId: number): Promise<void> => {
    await api.delete(`/project/${projectId}/tasks/${taskId}`);
};

// Atribui usuários a uma task
const assignUsersToTask = async (
    projectId: number,
    taskId: number,
    assignments: TaskAssignmentRequest[] // Espera um array
): Promise<TaskDetailsApiResponse> => {
    // A API espera um Set, mas enviamos um Array que o backend converterá
    const response = await api.post<TaskDetailsApiResponse>(`/project/${projectId}/tasks/${taskId}/assignments`, assignments);
    return response.data;
};

// Remove usuários de uma task
const removeAssignees = async (
    projectId: number,
    taskId: number,
    data: TaskAssignmentsBulkDeleteRequest
): Promise<void> => {
    // O Axios envia o 'data' no corpo da requisição DELETE
    await api.delete(`/project/${projectId}/tasks/${taskId}/assignments`, { data: data });
};

// Sair de uma task
const leaveTask = async (projectId: number, taskId: number): Promise<void> => {
    // O endpoint /leave não precisa do projectId na URL, mas vamos mantê-lo para consistência
    // O backend ignora o projectId na URL para esta rota específica
    await api.delete(`/project/${projectId}/tasks/${taskId}/leave`);
};


// --- FIM: NOVAS FUNÇÕES ---

export const taskService = {
  getMyTasks,
  createTask,
  getTaskById, // Exporta a nova função
  updateTaskStatus, // Exporta a nova função
  updateTaskDetails, // Exporta a nova função
  deleteTask, // Exporta a nova função
  assignUsersToTask, // Exporta a nova função
  removeAssignees, // Exporta a nova função
  leaveTask, // Exporta a nova função
};

// Definição do DTO de filtro (opcional, mas ajuda na organização)
// src/features/task/services/dto.ts
export interface TaskFilterReportDTO {
    title?: string;
    status?: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    assignedUserId?: number;
    updatedAtAfter?: string; // Formato YYYY-MM-DD
    updatedAtBefore?: string; // Formato YYYY-MM-DD
    dueDateAfter?: string; // Formato YYYY-MM-DD
    dueDateBefore?: string; // Formato YYYY-MM-DD
    createdAtAfter?: string; // Formato YYYY-MM-DD
    createdAtBefore?: string; // Formato YYYY-MM-DD
    conclusionDateAfter?: string; // Formato YYYY-MM-DD
    conclusionDateBefore?: string; // Formato YYYY-MM-DD
}
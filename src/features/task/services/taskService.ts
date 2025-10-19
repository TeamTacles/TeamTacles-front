// src/features/task/services/taskService.ts
import api from '../../../api/api';
import { PagedResponse } from '../../../types/api';
import { Task } from '../../../types/entities'; // Usaremos o tipo Task de entities.ts
import { Filters } from '../components/FilterModal'; // Importar Filters

// Interface para mapear o DTO do backend
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


// Função auxiliar para formatar datas (similar ao useProjects/useTeams)
const formatDateForApi = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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


export const taskService = {
  getMyTasks,
  // getTaskById, // Descomente e implemente se necessário
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
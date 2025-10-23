// src/features/project/services/projectReportService.ts
import api from '../../../api/api';
import { TaskFilterReportDTO } from '../../task/services/taskService';

// --- TIPOS PARA RELATÓRIOS ---

export interface TaskSummaryDTO {
    totalCount: number;
    doneCount: number;
    inProgressCount: number;
    toDoCount: number;
    overdueCount: number;
}

export interface MemberPerformanceDTO {
    userId: number;
    username: string;
    completedTasksCount: number;
}

export interface ProjectReportDTO {
    summary: TaskSummaryDTO;
    memberPerformanceRanking: MemberPerformanceDTO[];
}

export interface ProjectDashboardFilters {
    // Filtros opcionais que podem ser adicionados no futuro
    // Por enquanto, o dashboard não recebe filtros pela URL
}

// --- FUNÇÕES DE API ---

/**
 * Busca os dados do dashboard do projeto
 */
const getProjectDashboard = async (projectId: number): Promise<ProjectReportDTO> => {
    const response = await api.get<ProjectReportDTO>(`/project/${projectId}/dashboard`);
    return response.data;
};

/**
 * Exporta o relatório do projeto em PDF
 * @param projectId ID do projeto
 * @param filter Filtros opcionais para o relatório
 * @returns Blob com o conteúdo do PDF
 */
const exportProjectToPdf = async (
    projectId: number,
    filter?: TaskFilterReportDTO
): Promise<Blob> => {
    // Constrói os parâmetros da query
    const params = new URLSearchParams();
    
    if (filter?.title) params.append('title', filter.title);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.assignedUserId) params.append('assignedUserId', filter.assignedUserId.toString());
    if (filter?.dueDateAfter) params.append('dueDateAfter', filter.dueDateAfter);
    if (filter?.dueDateBefore) params.append('dueDateBefore', filter.dueDateBefore);
    if (filter?.createdAtAfter) params.append('createdAtAfter', filter.createdAtAfter);
    if (filter?.createdAtBefore) params.append('createdAtBefore', filter.createdAtBefore);
    if (filter?.conclusionDateAfter) params.append('conclusionDateAfter', filter.conclusionDateAfter);
    if (filter?.conclusionDateBefore) params.append('conclusionDateBefore', filter.conclusionDateBefore);

    const queryString = params.toString();
    const url = `/project/${projectId}/export/pdf${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url, {
        responseType: 'blob', // Importante para receber o PDF como Blob
    });

    return response.data;
};

/**
 * Faz o download do PDF no navegador (Web)
 */
const downloadPdfWeb = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Busca as tarefas do projeto com filtros para o relatório
 */
const getProjectTasksForReport = async (
    projectId: number,
    filter?: TaskFilterReportDTO
): Promise<any[]> => {
    // Constrói os parâmetros da query
    const params = new URLSearchParams();
    
    if (filter?.title) params.append('title', filter.title);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.assignedUserId) params.append('assignedUserId', filter.assignedUserId.toString());
    if (filter?.dueDateAfter) params.append('dueDateAfter', filter.dueDateAfter);
    if (filter?.dueDateBefore) params.append('dueDateBefore', filter.dueDateBefore);
    if (filter?.createdAtAfter) params.append('createdAtAfter', filter.createdAtAfter);
    if (filter?.createdAtBefore) params.append('createdAtBefore', filter.createdAtBefore);
    if (filter?.conclusionDateAfter) params.append('conclusionDateAfter', filter.conclusionDateAfter);
    if (filter?.conclusionDateBefore) params.append('conclusionDateBefore', filter.conclusionDateBefore);

    const queryString = params.toString();
    const url = `/project/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data.content || []; // Retorna o array de tarefas da resposta paginada
};

export const projectReportService = {
    getProjectDashboard,
    getProjectTasksForReport,
    exportProjectToPdf,
    downloadPdfWeb,
};
// src/features/project/services/projectReportService.ts
import api from '../../../api/api';
import { TaskFilterReportDTO } from '../../task/services/taskService';

// --- TIPOS PARA RELATÓRIOS --- (Manter os tipos existentes)
export interface TaskSummaryDTO {
    totalCount: number;
    doneCount: number;
    inProgressCount: number;
    toDoCount: number;
    overdueCount: number;
}

export interface MemberTaskDistributionDTO {
    userId: number;
    username: string;
    totalTasksCount: number;
    statusCounts: {
        [key in 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE']?: number;
    };
}

export interface ProjectReportDTO {
    summary: TaskSummaryDTO;
    memberTaskDistribution: MemberTaskDistributionDTO[];
}

// --- NOVO TIPO PARA O RETORNO DA FUNÇÃO DE EXPORTAÇÃO ---
interface PdfExportResult {
    blob: Blob;
    filename: string;
}

// --- FUNÇÕES DE API ---

// Função getProjectDashboard (manter como está)
const getProjectDashboard = async (projectId: number, filter?: TaskFilterReportDTO): Promise<ProjectReportDTO> => {
    // ... (código existente sem alterações)
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
    if (filter?.isOverdue !== undefined) params.append('isOverdue', String(filter.isOverdue));

    const queryString = params.toString();
    const url = `/project/${projectId}/dashboard${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<ProjectReportDTO>(url);
    return response.data;
};

/**
 * Exporta o relatório do projeto em PDF
 * @param projectId ID do projeto
 * @param filter Filtros opcionais para o relatório
 * @returns Objeto contendo o Blob do PDF e o nome do arquivo extraído do cabeçalho
 */
const exportProjectToPdf = async (
    projectId: number,
    filter?: TaskFilterReportDTO
): Promise<PdfExportResult> => { // <-- Alterado o tipo de retorno
    // Constrói os parâmetros da query (mesma lógica de antes)
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
     if (filter?.isOverdue !== undefined) params.append('isOverdue', String(filter.isOverdue)); // Adiciona isOverdue se presente

    const getDeviceTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
    };

    const queryString = params.toString();
    const url = `/project/${projectId}/export/pdf${queryString ? `?${queryString}` : ''}`;
    const userTimeZone = getDeviceTimezone();
    const response = await api.get(url, {
        responseType: 'blob', // Importante para receber o PDF como Blob
        headers: {
            'X-Timezone': userTimeZone, // Envia o fuso horário do usuário
        },
    });

    // --- EXTRAÇÃO DO NOME DO ARQUIVO ---
    let filename = `relatorio_projeto_${projectId}.pdf`; // Nome padrão
    const contentDisposition = response.headers['content-disposition'];

    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/);
        if (filenameMatch && filenameMatch[1]) {
            // Decodifica o nome do arquivo se estiver em formato UTF-8 URL encoded
             try {
                filename = decodeURIComponent(filenameMatch[1]);
            } catch (e) {
                console.warn("Could not decode filename, using raw value:", filenameMatch[1]);
                filename = filenameMatch[1]; // Usa o valor bruto se a decodificação falhar
            }
        }
         // Fallback se a regex acima falhar, tenta uma mais simples
         else {
             const simpleFilenameMatch = contentDisposition.match(/filename="(.+)"/);
             if (simpleFilenameMatch && simpleFilenameMatch[1]) {
                 filename = simpleFilenameMatch[1];
             }
         }
    }
    // --- FIM DA EXTRAÇÃO ---

    console.log(`[PDF Export] Extracted filename: ${filename}`); // Log para depuração

    return { blob: response.data, filename }; // <-- Retorna o objeto
};

// Função downloadPdfWeb (manter como está)
const downloadPdfWeb = (blob: Blob, filename: string) => {
    // ... (código existente sem alterações)
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Função getProjectTasksForReport (manter como está)
const getProjectTasksForReport = async (
    projectId: number,
    filter?: TaskFilterReportDTO
): Promise<any[]> => {
    // ... (código existente sem alterações)
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
     if (filter?.isOverdue !== undefined) params.append('isOverdue', String(filter.isOverdue)); // Adiciona isOverdue se presente

    const queryString = params.toString();
    const url = `/project/${projectId}/tasks${queryString ? `?${queryString}` : ''}`; // Corrigido para /tasks

    const response = await api.get(url);
    // Ajuste para pegar 'content' se a API retornar um objeto paginado
    return Array.isArray(response.data) ? response.data : (response.data.content || []);
};

// Exporta o serviço (manter como está)
export const projectReportService = {
    getProjectDashboard,
    getProjectTasksForReport,
    exportProjectToPdf,
    downloadPdfWeb,
};
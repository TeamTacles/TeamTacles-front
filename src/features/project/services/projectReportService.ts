import api from '../../../api/api';
import { TaskFilterReportDTO } from '../../task/services/taskService';
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

interface PdfExportResult {
    blob: Blob;
    filename: string;
}

const getProjectDashboard = async (projectId: number, filter?: TaskFilterReportDTO): Promise<ProjectReportDTO> => {
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


const exportProjectToPdf = async (
    projectId: number,
    filter?: TaskFilterReportDTO
): Promise<PdfExportResult> => {
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

    const getDeviceTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
    };

    const queryString = params.toString();
    const url = `/project/${projectId}/export/pdf${queryString ? `?${queryString}` : ''}`;
    const userTimeZone = getDeviceTimezone();
    const response = await api.get(url, {
        responseType: 'blob',
        headers: {
            'X-Timezone': userTimeZone,
        },
    });

    let filename = `relatorio_projeto_${projectId}.pdf`;
    const contentDisposition = response.headers['content-disposition'];

    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/);
        if (filenameMatch && filenameMatch[1]) {
             try {
                filename = decodeURIComponent(filenameMatch[1]);
            } catch (e) {
                console.warn("Could not decode filename, using raw value:", filenameMatch[1]);
                filename = filenameMatch[1];
            }
        }
         else {
             const simpleFilenameMatch = contentDisposition.match(/filename="(.+)"/);
             if (simpleFilenameMatch && simpleFilenameMatch[1]) {
                 filename = simpleFilenameMatch[1];
             }
         }
    }

    return { blob: response.data, filename };
};

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

const getProjectTasksForReport = async (
    projectId: number,
    filter?: TaskFilterReportDTO
): Promise<any[]> => {
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
    const url = `/project/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return Array.isArray(response.data) ? response.data : (response.data.content || []);
};

export const projectReportService = {
    getProjectDashboard,
    getProjectTasksForReport,
    exportProjectToPdf,
    downloadPdfWeb,
};
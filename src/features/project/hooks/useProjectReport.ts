import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { projectReportService, ProjectReportDTO } from '../services/projectReportService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { useNotification } from '../../../contexts/NotificationContext';
import { TaskFilterReportDTO } from '../../task/services/taskService';

export function useProjectReport(projectId: number) {
  const { showNotification } = useNotification();

  const [report, setReport] = useState<ProjectReportDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [filters, setFilters] = useState<TaskFilterReportDTO>({}); // State to hold current filters

  const fetchDashboard = useCallback(async (appliedFilters: TaskFilterReportDTO = filters) => { // Modified: Accept filters, default to internal state
    if (!projectId) return;

    setLoading(true); 
    try {
      const data = await projectReportService.getProjectDashboard(projectId, appliedFilters);
      setReport(data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      showNotification({
        type: 'error',
        message: getErrorMessage(error),
      });
      setReport(null); 
    } finally {
      setLoading(false);
      if (initialLoading) setInitialLoading(false); 
    }
  }, [projectId, showNotification, initialLoading, filters]); 

  const handleExportPdf = useCallback(async () => {
    if (!projectId) return;

    setIsExportingPdf(true);
    try {
      
      const { blob, filename } = await projectReportService.exportProjectToPdf(projectId, filters);



      if (Platform.OS === 'web') {
        projectReportService.downloadPdfWeb(blob, filename);
        showNotification({ type: 'success', message: 'PDF exportado com sucesso!' });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const pdfBase64 = base64data.split(',')[1]; 

          try {
                const cacheDir = (FileSystem as any).cacheDirectory as string | null;
                const docDir = (FileSystem as any).documentDirectory as string | null;

                const pdfUri = `${cacheDir ?? docDir ?? ''}${filename}`;


                await FileSystem.writeAsStringAsync(pdfUri, pdfBase64, {
                    encoding: 'base64', 
                });

                console.log('📄 PDF salvo em:', pdfUri);

                // Compartilhar PDF
                if (!(await Sharing.isAvailableAsync())) {
                    showNotification({
                    type: 'error',
                    message: 'Compartilhamento não disponível neste dispositivo.',
                    });
                    return;
                }

                await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartilhar Relatório PDF',
                    UTI: 'com.adobe.pdf',
                });

            } catch (err: any) {
                console.error('Erro ao salvar/compartilhar PDF:', err);
                // Evita mostrar erro se o usuário apenas cancelou o compartilhamento
                if (err.code !== 'ERR_SHARING_CANCELLED' && err.message !== 'Operation canceled' && err.message !== 'User dismissed modal view controller') {
                    showNotification({
                    type: 'error',
                    message: 'Não foi possível salvar ou compartilhar o PDF.',
                    });
                }
            }
        };

        reader.onerror = (error) => {
          console.error('Erro ao ler o Blob:', error);
          showNotification({
            type: 'error',
            message: 'Erro ao processar o conteúdo do PDF.',
          });
        };
      }
    } catch (error) {
       console.error('Erro ao exportar PDF:', error);
       showNotification({ type: 'error', message: getErrorMessage(error), });
    } finally {
        setIsExportingPdf(false);
    }
  }, [projectId, filters, showNotification]); 


  
  const applyFilters = useCallback((newFilters: TaskFilterReportDTO) => {
    setFilters(newFilters); 
    fetchDashboard(newFilters); 
  }, [fetchDashboard]); 

  
  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters); 
    fetchDashboard(emptyFilters); 
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard({});
  }, [projectId]); 

  return {
    report,
    loading,
    initialLoading,
    isExportingPdf,
    filters, 
    fetchDashboard, 
    handleExportPdf,
    applyFilters, 
    clearFilters, 
  };
}
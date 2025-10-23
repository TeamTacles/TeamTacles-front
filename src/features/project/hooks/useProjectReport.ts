// src/features/project/hooks/useProjectReport.ts
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
  const [filters, setFilters] = useState<TaskFilterReportDTO>({});

  /**
   * Busca os dados do dashboard
   */
  const fetchDashboard = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const data = await projectReportService.getProjectDashboard(projectId);
      setReport(data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      showNotification({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [projectId, showNotification]);

  /**
   * Exporta o relatório em PDF (compatível com Expo SDK 54+)
   */
  const handleExportPdf = useCallback(async () => {
    if (!projectId) return;

    setIsExportingPdf(true);
    try {
      const blob = await projectReportService.exportProjectToPdf(projectId, filters);
      const filename = `relatorio_projeto_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`;

      if (Platform.OS === 'web') {
        // --- Web ---
        projectReportService.downloadPdfWeb(blob, filename);
        showNotification({ type: 'success', message: 'PDF exportado com sucesso!' });
      } else {
        // --- Mobile ---
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const pdfBase64 = base64data.split(',')[1]; // remove prefixo data:application/pdf;base64,

          try {
                // Corrige a tipagem manualmente (mantém compatibilidade com o runtime)
                const cacheDir = (FileSystem as any).cacheDirectory as string | null;
                const docDir = (FileSystem as any).documentDirectory as string | null;

                // Usa o cacheDirectory se existir, senão fallback para documentDirectory
                const pdfUri = `${cacheDir ?? docDir ?? ''}${filename}`;

                // Salva o arquivo como Base64
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

                // Opcional: deletar o arquivo após compartilhar
                // await FileSystem.deleteAsync(pdfUri);
            } catch (err: any) {
                console.error('Erro ao salvar/compartilhar PDF:', err);
                if (err.code !== 'ERR_SHARING_CANCELLED' && err.message !== 'Operation canceled') {
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
      showNotification({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setIsExportingPdf(false);
    }
  }, [projectId, filters, showNotification]);

  const applyFilters = useCallback((newFilters: TaskFilterReportDTO) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
    setFilters,
  };
}

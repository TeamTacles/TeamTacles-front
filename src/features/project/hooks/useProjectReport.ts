// src/features/project/hooks/useProjectReport.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
// Keep the legacy import as requested
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
// Import the updated service that returns { blob, filename }
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

  /**
   * Busca os dados do dashboard, applying the provided filters.
   * Uses the hook's internal filters state if no filters are passed.
   */
  const fetchDashboard = useCallback(async (appliedFilters: TaskFilterReportDTO = filters) => { // Modified: Accept filters, default to internal state
    if (!projectId) return;

    setLoading(true); // Always set loading before request
    try {
      // Pass the filters to the service
      const data = await projectReportService.getProjectDashboard(projectId, appliedFilters);
      setReport(data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      showNotification({
        type: 'error',
        message: getErrorMessage(error),
      });
      setReport(null); // Clear report on error
    } finally {
      setLoading(false);
      if (initialLoading) setInitialLoading(false); // Only set initialLoading to false once
    }
  }, [projectId, showNotification, initialLoading, filters]); // Added filters to dependencies

  /**
   * Exporta o relatório em PDF (compatível com Expo SDK 54+)
   * Uses the current filters state.
   */
  const handleExportPdf = useCallback(async () => {
    // ... (implementation remains the same, it already uses the 'filters' state) ...
    if (!projectId) return;

    setIsExportingPdf(true);
    try {
      // --- MODIFICATION START: Get blob AND filename from service ---
      // The export function already uses the current 'filters' state
      const { blob, filename } = await projectReportService.exportProjectToPdf(projectId, filters);
      // --- MODIFICATION END ---

      // --- REMOVE local filename generation ---
      // const filename = `relatorio_projeto_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`;
      // --- REMOVE END ---


      if (Platform.OS === 'web') {
        // --- Web ---
        // Pass the filename obtained from the service
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
                // Keep the manual type casting for legacy compatibility
                const cacheDir = (FileSystem as any).cacheDirectory as string | null;
                const docDir = (FileSystem as any).documentDirectory as string | null;

                // Usa o cacheDirectory se existir, senão fallback para documentDirectory
                // --- MODIFICATION START: Use filename from service ---
                const pdfUri = `${cacheDir ?? docDir ?? ''}${filename}`;
                // --- MODIFICATION END ---


                // Salva o arquivo como Base64
                await FileSystem.writeAsStringAsync(pdfUri, pdfBase64, {
                    // Use the correct encoding constant for legacy if needed, otherwise 'base64' is fine
                    encoding: 'base64', // Or FileSystem.EncodingType.Base64 if available in legacy
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
  }, [projectId, filters, showNotification]); // Dependencies remain the same


  /**
   * Applies new filters and refetches the dashboard data.
   */
  const applyFilters = useCallback((newFilters: TaskFilterReportDTO) => {
    setFilters(newFilters); // Update internal filter state
    fetchDashboard(newFilters); // Refetch dashboard with new filters
  }, [fetchDashboard]); // Depends on fetchDashboard

  /**
   * Clears filters and refetches the dashboard data.
   */
  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters); // Clear internal filter state
    fetchDashboard(emptyFilters); // Refetch dashboard without filters
  }, [fetchDashboard]); // Depends on fetchDashboard

  // Fetch initial dashboard data on mount
  useEffect(() => {
    // Pass initial (empty) filters
    fetchDashboard({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // Only depends on projectId for initial fetch

  return {
    report,
    loading,
    initialLoading,
    isExportingPdf,
    filters, // Expose filters state if needed externally
    fetchDashboard, // Expose fetchDashboard if needed for manual refresh
    handleExportPdf,
    applyFilters, // Use this function to apply filters from the screen
    clearFilters, // Use this function to clear filters from the screen
    // setFilters can be removed if applyFilters/clearFilters are sufficient
  };
}
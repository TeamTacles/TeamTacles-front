// src/features/task/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { taskService, UserTaskApiResponse } from '../services/taskService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { Task } from '../../../types/entities';
import { Filters } from '../components/FilterModal';

// Função mapApiResponseToTask permanece a mesma...
const mapApiResponseToTask = (apiTask: UserTaskApiResponse): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  dueDate: apiTask.dueDate,
  projectId: apiTask.project.id,
  projectName: apiTask.project.title,
  status: apiTask.taskStatus,
  createdAt: apiTask.createdAt ? new Date(apiTask.createdAt).getTime() : Date.now(),
});


export function useTasks(isAuthenticated: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [refreshingTasks, setRefreshingTasks] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [titleFilter, setTitleFilter] = useState('');

  const fetchTasks = useCallback(async (page: number, currentFilters: Filters, currentTitle: string) => {
    const isRefreshing = page === 0;
    // Evitar buscas concorrentes ou desnecessárias
    // Usar refs ou checar estados diretamente aqui, se necessário, em vez de depender deles no array
    // if ((loadingTasks || refreshingTasks) && !isRefreshing) return; // Remover esta linha ou adaptar
    // if (!hasMoreTasks && !isRefreshing) return; // Remover esta linha ou adaptar

    // É mais seguro verificar a condição *antes* de iniciar a busca
    if (!isRefreshing && !hasMoreTasks) {
        console.log("No more tasks to load.");
        return; // Sai se não for refresh e não houver mais páginas
    }
     // Adicionar uma verificação para evitar buscas concorrentes
     // (Pode ser necessário um useRef para controlar isso de forma mais robusta se houver múltiplas fontes de trigger)
     if (loadingTasks || refreshingTasks) {
         console.log("Already fetching tasks.");
         return;
     }


    if (isRefreshing) {
      setRefreshingTasks(true);
      setLoadingTasks(false); // Garantir que loading normal esteja falso durante refresh
    } else {
      setLoadingTasks(true);
      setRefreshingTasks(false); // Garantir que refresh esteja falso durante loading normal
    }

    try {
      const pageToFetch = isRefreshing ? 0 : page;
      const response = await taskService.getMyTasks(pageToFetch, 20, currentFilters, currentTitle);
      const tasksFromApi = response.content.map(mapApiResponseToTask);

      // Usar a forma funcional do setState para garantir acesso ao estado mais recente
      setTasks(prevTasks => (isRefreshing ? tasksFromApi : [...prevTasks, ...tasksFromApi]));
      setHasMoreTasks(!response.last);
      setCurrentPage(pageToFetch + 1);

    } catch (error) {
      console.error("Erro ao buscar tarefas:", getErrorMessage(error));
      if (isRefreshing) {
          setTasks([]);
          setCurrentPage(0);
          setHasMoreTasks(true);
      }
      // Considerar mostrar notificação ao usuário aqui
    } finally {
      // Garantir que ambos os loadings sejam desativados corretamente
      setRefreshingTasks(false);
      setLoadingTasks(false);
    }
    // --- ALTERAÇÃO AQUI ---
    // Removido loadingTasks, refreshingTasks, hasMoreTasks do array de dependências
  }, [/* Nenhuma dependência de estado interno aqui, apenas props/contextos estáveis se houver */]);
  // --- FIM DA ALTERAÇÃO ---

  // Efeito para buscar tarefas quando autenticado ou filtros mudam
  useEffect(() => {
    if (isAuthenticated) {
      // Sempre busca do zero quando filtros ou autenticação mudam
       setTasks([]); // Limpa tarefas atuais para indicar recarregamento
       setCurrentPage(0); // Reseta a página
       setHasMoreTasks(true); // Assume que há páginas novamente
       fetchTasks(0, filters, titleFilter); // Inicia busca da primeira página
    } else {
      setTasks([]);
      setCurrentPage(0);
      setHasMoreTasks(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filters, titleFilter]); // Manter fetchTasks fora daqui para evitar loop se ele for instável

  // Funções de controle (envolvidas em useCallback)
  const refreshTasks = useCallback(() => {
    // Não precisa resetar estados aqui, pois fetchTasks(0,...) fará isso
    fetchTasks(0, filters, titleFilter);
  }, [fetchTasks, filters, titleFilter]); // fetchTasks agora é (ou deveria ser) estável

  const loadMoreTasks = useCallback(() => {
    // Adicionar verificação explícita de loading/refreshing aqui também
    if (hasMoreTasks && !loadingTasks && !refreshingTasks) {
      fetchTasks(currentPage, filters, titleFilter);
    }
  }, [hasMoreTasks, loadingTasks, refreshingTasks, currentPage, filters, titleFilter, fetchTasks]); // fetchTasks estável

  const applyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    // Não precisa chamar fetchTasks aqui, o useEffect vai cuidar disso
    // Resetar paginação será feito pelo useEffect ao detectar mudança nos filtros
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setTitleFilter('');
     // Não precisa chamar fetchTasks aqui, o useEffect vai cuidar disso
  }, []);

  const searchByTitle = useCallback((title: string) => {
    setTitleFilter(title);
     // Não precisa chamar fetchTasks aqui, o useEffect vai cuidar disso
  }, []);

  return {
    tasks,
    loadingTasks,
    refreshingTasks,
    hasMoreTasks,
    loadMoreTasks,
    refreshTasks,
    applyFilters,
    clearFilters,
    searchByTitle,
  };
}
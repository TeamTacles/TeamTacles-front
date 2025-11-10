import { useState, useEffect, useCallback } from 'react';
import { taskService, UserTaskApiResponse } from '../services/taskService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { Task } from '../../../types/entities';
import { Filters } from '../components/FilterModal';

const mapApiResponseToTask = (apiTask: UserTaskApiResponse): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  dueDate: apiTask.dueDate,
  projectId: apiTask.project.id,
  projectName: apiTask.project.title,
  status: apiTask.taskStatus,
  createdAt: apiTask.createdAt ? new Date(apiTask.createdAt).getTime() : Date.now(),
  assignments: [],
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
    
    if (!isRefreshing && !hasMoreTasks) {
        console.log("No more tasks to load.");
        return; // Sai se não for refresh e não houver mais páginas
    }
  
     if (loadingTasks || refreshingTasks) {
         console.log("Already fetching tasks.");
         return;
     }


    if (isRefreshing) {
      setRefreshingTasks(true);
      setLoadingTasks(false); 
    } else {
      setLoadingTasks(true);
      setRefreshingTasks(false); 
    }

    try {
      const pageToFetch = isRefreshing ? 0 : page;
      const response = await taskService.getMyTasks(pageToFetch, 20, currentFilters, currentTitle);
      const tasksFromApi = response.content.map(mapApiResponseToTask);

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
    } finally {
      setRefreshingTasks(false);
      setLoadingTasks(false);
    }
    
  }, [isAuthenticated, filters, titleFilter]);

  useEffect(() => {
    if (isAuthenticated) {
       setTasks([]); 
       setCurrentPage(0); 
       setHasMoreTasks(true); 
       fetchTasks(0, filters, titleFilter); 
    } else {
      setTasks([]);
      setCurrentPage(0);
      setHasMoreTasks(true);
    }
  }, [isAuthenticated, filters, titleFilter]); 

  const refreshTasks = useCallback(() => {
    fetchTasks(0, filters, titleFilter);
  }, [fetchTasks, filters, titleFilter]);

  const loadMoreTasks = useCallback(() => {
    if (hasMoreTasks && !loadingTasks && !refreshingTasks) {
      fetchTasks(currentPage, filters, titleFilter);
    }
  }, [hasMoreTasks, loadingTasks, refreshingTasks, currentPage, filters, titleFilter, fetchTasks]); 

  const applyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setTitleFilter('');
  }, []);

  const searchByTitle = useCallback((title: string) => {
    setTitleFilter(title);
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
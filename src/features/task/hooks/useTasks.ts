import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
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
  status: apiTask.status, 
  originalStatus: apiTask.originalStatus, 
  createdAt: apiTask.createdAt ? new Date(apiTask.createdAt).getTime() : Date.now(),
  assignments: [],
});


export function useTasks(isAuthenticated: boolean) {
  const [filters, setFilters] = useState<Filters>({});
  const [titleFilter, setTitleFilter] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['tasks', filters, titleFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await taskService.getMyTasks(pageParam, 20, filters, titleFilter);
      const tasksFromApi = response.content.map(mapApiResponseToTask);

      return {
        tasks: tasksFromApi,
        nextPage: response.last ? undefined : pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: isAuthenticated, 
    staleTime: 1000 * 60 * 5, // 5 minutos para evitar refetch desnecessário
    gcTime: 1000 * 60 * 10,   // 10 minutos para manter o cache na memória
  });

  const tasks = useMemo(() => {
    const allTasks = data?.pages.flatMap(page => page.tasks) ?? [];
    return [...new Map(allTasks.map(t => [t.id, t])).values()];
  }, [data]);

  const refreshTasks = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMoreTasks = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isRefetching, fetchNextPage]);

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
    
    initialLoading: isLoading,
    
    loadingTasks: isFetchingNextPage,
    
    refreshingTasks: isRefetching && !isLoading && !isFetchingNextPage,
    
    hasMoreTasks: hasNextPage ?? false,
    loadMoreTasks,
    refreshTasks,
    applyFilters,
    clearFilters,
    searchByTitle,
  };
}
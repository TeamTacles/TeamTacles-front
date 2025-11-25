import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { projectService, ProjectMember } from '../services/projectService';
import { useNotification } from '../../../contexts/NotificationContext';

export function useProjectMembers(projectId: number) {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

 
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: initialLoading,
    isRefetching: refreshingMembers,
    refetch
  } = useInfiniteQuery({
    queryKey: ['project-members', projectId], 
    queryFn: async ({ pageParam = 0 }) => {
      const response = await projectService.getProjectMembers(projectId, pageParam, 10);
      return {
        members: response.content,
        nextPage: response.last ? undefined : pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!projectId, // Só busca se tiver ID
    
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10,   // 10 minutos
  });

  const members = useMemo(() => {
    const allMembers = data?.pages.flatMap(page => page.members) ?? [];
    return [...new Map(allMembers.map(m => [m.userId, m])).values()];
  }, [data]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const setMembers = (updater: (prev: ProjectMember[]) => ProjectMember[]) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      
  };

  return {
    members,
    setMembers, 
    
    loadingMembers: isFetchingNextPage, 
    initialLoading, 
    refreshingMembers: !!refreshingMembers, 
    
    handleRefresh,
    handleLoadMore,
  };
}
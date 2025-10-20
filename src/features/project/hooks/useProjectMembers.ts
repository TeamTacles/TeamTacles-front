// src/features/project/hooks/useProjectMembers.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { projectService, ProjectMember } from '../services/projectService';
import { useNotification } from '../../../contexts/NotificationContext';

export function useProjectMembers(projectId: number) {
  const { showNotification } = useNotification();

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [refreshingMembers, setRefreshingMembers] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);

  const fetchMembers = useCallback(async (page: number, isInitialLoad = false, isRefresh = false) => {
    if (isFetching.current) return;
    if (!hasMore && !isInitialLoad && !isRefresh) return;

    isFetching.current = true;

    if (isInitialLoad) {
        setInitialLoading(true);
    } else if (isRefresh) {
        setRefreshingMembers(true);
    } else {
        setLoadingMembers(true);
    }

    try {
      const pageToFetch = isInitialLoad || isRefresh ? 0 : page;
      const response = await projectService.getProjectMembers(projectId, pageToFetch, 10);
      const membersFromApi = response.content;

      setMembers(prev => {
          const currentMembers = (isInitialLoad || isRefresh) ? [] : prev;
          const existingIds = new Set(currentMembers.map(m => m.userId));
          const newMembers = membersFromApi.filter(m => !existingIds.has(m.userId));
          return [...currentMembers, ...newMembers];
      });

      setHasMore(!response.last);
      setCurrentPage(pageToFetch + 1);

    } catch (error) {
      showNotification({ type: 'error', message: 'Erro ao carregar membros.' });
       if(isInitialLoad || isRefresh){
           setMembers([]);
           setCurrentPage(0);
           setHasMore(true);
       }
    } finally {
       if (isInitialLoad) {
           setInitialLoading(false);
       } else if (isRefresh) {
           setRefreshingMembers(false);
       } else {
           setLoadingMembers(false);
       }
       isFetching.current = false;
    }
  }, [projectId, hasMore, showNotification]);

  useEffect(() => {
    fetchMembers(0, true);
  }, [projectId, fetchMembers]);

  const handleRefresh = useCallback(() => {
    fetchMembers(0, false, true);
  }, [fetchMembers]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMembers && !refreshingMembers && !initialLoading && !isFetching.current) {
        fetchMembers(currentPage);
    }
  }, [hasMore, loadingMembers, refreshingMembers, initialLoading, currentPage, fetchMembers]);

  return {
    members,
    setMembers,
    loadingMembers,
    refreshingMembers,
    initialLoading,
    handleRefresh,
    handleLoadMore,
  };
}
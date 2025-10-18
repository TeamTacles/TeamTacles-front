// src/features/project/hooks/useProjectMembers.ts
import { useState, useEffect, useCallback } from 'react';
import { projectService, ProjectMember } from '../services/projectService';
import { useNotification } from '../../../contexts/NotificationContext';

export function useProjectMembers(projectId: number) {
  const { showNotification } = useNotification();

  // States
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [refreshingMembers, setRefreshingMembers] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchMembers = useCallback(async (page: number) => {
    if (loadingMembers || (page > 0 && refreshingMembers)) return;
    if (!hasMore && page > 0) return;
    const isRefreshing = page === 0;

    if (isRefreshing) {
      setRefreshingMembers(true);
    } else {
      setLoadingMembers(true);
    }

    try {
      const response = await projectService.getProjectMembers(projectId, page, 20);
      const membersFromApi = response.content;

      if (isRefreshing) {
        setMembers(membersFromApi);
      } else {
        setMembers(prev => [...prev, ...membersFromApi]);
      }
      setHasMore(!response.last);
      setCurrentPage(page + 1);
    } catch (error) {
      showNotification({ type: 'error', message: 'Erro ao carregar membros.' });
    } finally {
      if (isRefreshing) {
        setRefreshingMembers(false);
      } else {
        setLoadingMembers(false);
      }
    }
  }, [projectId, hasMore, loadingMembers, refreshingMembers, showNotification]);

  useEffect(() => {
    fetchMembers(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setCurrentPage(0);
    setHasMore(true);
    fetchMembers(0);
  };

  const handleLoadMore = () => {
    fetchMembers(currentPage);
  };

  return {
    members,
    setMembers,
    loadingMembers,
    refreshingMembers,
    handleRefresh,
    handleLoadMore,
  };
}

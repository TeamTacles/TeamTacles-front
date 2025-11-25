import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { Team } from '../../../types/entities';
import { Filters } from '../../task/components/FilterModal';
import { getInitialsFromName } from '../../../utils/stringUtils';

export function useTeams(isAuthenticated: boolean) {
  const [filters, setFilters] = useState<Filters>({});
  const [nameFilter, setNameFilter] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['teams', filters, nameFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await teamService.getTeams(pageParam, 20, filters, nameFilter);

      const teamsFromApi: Team[] = response.content.map((team: any) => ({
        ...team, 
        id: team.id,
        title: team.name, 
        description: team.description,
        memberCount: team.memberCount, 
        
        members: (team.memberNames || []).map((name: string) => ({
          name,
          initials: getInitialsFromName(name),
        })),
        
        createdAt: team.createdAt || new Date().toISOString(),
      }));

      return {
        teams: teamsFromApi,
        nextPage: response.last ? undefined : pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: isAuthenticated,
    
    staleTime: 1000 * 60 * 5, // 5 minutos 
    gcTime: 1000 * 60 * 10,   // 10 minutos 
  });

  const teams = useMemo(() => {
    const allTeams = data?.pages.flatMap(page => page.teams) ?? [];
    return [...new Map(allTeams.map(t => [t.id, t])).values()];
  }, [data]);

  const refreshTeams = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const loadMoreTeams = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isRefetching, fetchNextPage]);

  const applyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setNameFilter('');
  }, []);
  
  const searchByName = useCallback((name: string) => {
    setNameFilter(name);
  }, []);

  return {
    teams,
    
    initialLoading: isLoading,
    
    loadingTeams: isFetchingNextPage,
    
    refreshingTeams: isRefetching && !isLoading && !isFetchingNextPage,
    
    hasMoreTeams: hasNextPage ?? false,
    loadMoreTeams,
    refreshTeams,
    setTeams: () => {}, 
    applyFilters,
    clearFilters,
    searchByName,
    filters,
  };
}
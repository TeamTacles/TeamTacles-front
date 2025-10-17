// src/features/team/hooks/useTeams.ts
import { useState, useEffect, useCallback } from 'react';
import { teamService } from '../services/teamService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { Team } from '../../../types/entities';
import { Filters } from '../../task/components/FilterModal';

export function useTeams(isAuthenticated: boolean) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreTeams, setHasMoreTeams] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [refreshingTeams, setRefreshingTeams] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [nameFilter, setNameFilter] = useState('');

  // A função fetchTeams precisa ter suas dependências declaradas corretamente
  const fetchTeams = useCallback(async (page: number, currentFilters: Filters, currentName: string) => {
    const isRefreshing = page === 0;
    if (isRefreshing) {
      setRefreshingTeams(true);
    } else {
      setLoadingTeams(true);
    }

    try {
      const response = await teamService.getTeams(page, 20, currentFilters, currentName);

      const teamsFromApi: Team[] = response.content.map(team => ({
        ...team,
        id: team.id,
        title: team.name,
        members: [], 
        createdAt: new Date(), 
      }));

      if (isRefreshing) {
        setTeams(teamsFromApi);
      } else {
        setTeams(prev => [...prev, ...teamsFromApi]);
      }
      
      setCurrentPage(page + 1);
      setHasMoreTeams(!response.last);
    } catch (error) {
      console.error("Erro ao buscar times:", getErrorMessage(error));
      if (isRefreshing) {
        setTeams([]);
        setCurrentPage(0);
        setHasMoreTeams(false);
      }
    } finally {
      if (isRefreshing) {
        setRefreshingTeams(false);
      } else {
        setLoadingTeams(false);
      }
    }
  }, []); // Mantemos o array vazio, pois as funções de set do state são estáveis

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams(0, filters, nameFilter);
    } else {
      setTeams([]);
      setCurrentPage(0);
      setHasMoreTeams(true);
    }
  }, [isAuthenticated, filters, nameFilter, fetchTeams]);

  // --- INÍCIO DA CORREÇÃO ---
  
  // 1. Envolver as funções que serão exportadas com `useCallback`
  const refreshTeams = useCallback(() => {
    fetchTeams(0, filters, nameFilter);
  }, [fetchTeams, filters, nameFilter]);
  
  const loadMoreTeams = useCallback(() => {
    if (hasMoreTeams && !loadingTeams && !refreshingTeams) {
      fetchTeams(currentPage, filters, nameFilter);
    }
  }, [hasMoreTeams, loadingTeams, refreshingTeams, currentPage, filters, nameFilter, fetchTeams]);

  const applyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setNameFilter('');
    setCurrentPage(0);
  }, []);
  
  const searchByName = useCallback((name: string) => {
    setNameFilter(name);
    setCurrentPage(0);
  }, []);

  // --- FIM DA CORREÇÃO ---

  return {
    teams,
    loadingTeams,
    refreshingTeams,
    hasMoreTeams,
    loadMoreTeams,
    refreshTeams,
    setTeams,
    applyFilters,
    clearFilters,
    searchByName,
    filters,
  };
}
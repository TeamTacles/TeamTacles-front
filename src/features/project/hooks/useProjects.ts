import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, CreateProjectRequest, ProjectDetails } from '../services/projectService'; 
import { getErrorMessage } from '../../../utils/errorHandler';
import { Project, Member } from '../../../types/entities'; 
import { Filters } from '../../task/components/FilterModal';
import { getInitialsFromName } from '../../../utils/stringUtils';
import { useAppContext } from '../../../contexts/AppContext'; 

interface ProjectApiResponse extends ProjectDetails {
  taskCount: number;
  memberNames: string[];
}

export function useProjects(isAuthenticated: boolean) {
  const { user } = useAppContext();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({});
  const [titleFilter, setTitleFilter] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['projects', filters, titleFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await projectService.getProjects(pageParam, 20, filters, titleFilter);
      const projectsFromApiRaw = response.content as unknown as ProjectApiResponse[];

      const projectsFromApi: Project[] = projectsFromApiRaw.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        projectRole: project.projectRole,
        teamMembers: project.memberNames.map(name => ({
          name: name,
          initials: getInitialsFromName(name)
        })),
        createdAt: Date.now(),
        taskCount: project.taskCount,
      }));

      return {
        projects: projectsFromApi,
        nextPage: response.last ? undefined : pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos para evitar refetch desnecessário
    gcTime: 1000 * 60 * 10,   // 10 minutos para manter o cache na memória
  });

  const projects = useMemo(() => {
    const allProjects = data?.pages.flatMap(page => page.projects) ?? [];
    return [...new Map(allProjects.map(p => [p.id, p])).values()];
  }, [data]);

  const createProjectMutation = useMutation({
    mutationFn: (projectData: CreateProjectRequest) => projectService.createProject(projectData),
    onSuccess: (createdProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const addProject = async (projectData: CreateProjectRequest): Promise<Project> => {
    try {
      const createdProject = await createProjectMutation.mutateAsync(projectData);

      const newProject: Project = {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        projectRole: createdProject.projectRole,
        teamMembers: [{ name: user?.name ?? 'Usuário', initials: user?.initials ?? '?' }],
        createdAt: Date.now(),
        taskCount: 0
      };
      
      return newProject;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const refreshProjects = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMoreProjects = useCallback(() => {
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
    projects,
    
    initialLoading: isLoading,
    
    loadingProjects: isFetchingNextPage,
    
    refreshingProjects: isRefetching && !isLoading && !isFetchingNextPage,
    
    hasMoreProjects: hasNextPage ?? false,
    addProject,
    loadMoreProjects,
    refreshProjects,
    applyFilters,
    clearFilters,
    searchByTitle,
    filters,
  };
}
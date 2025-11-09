import { useState, useEffect, useCallback } from 'react';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [refreshingProjects, setRefreshingProjects] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [titleFilter, setTitleFilter] = useState('');

  const fetchProjects = useCallback(async (page: number, currentFilters: Filters, currentTitle: string) => {
    const isRefreshing = page === 0;
    if (isRefreshing) {
      setRefreshingProjects(true);
    } else {
      setLoadingProjects(true);
    }

    try {
      const response = await projectService.getProjects(page, 20, currentFilters, currentTitle);
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


      if (isRefreshing) {
        setProjects(projectsFromApi);
      } else {
        setProjects(prev => [...prev, ...projectsFromApi]);
      }

      setCurrentPage(page + 1);
      setHasMoreProjects(!response.last);
    } catch (error) {
      console.error("Erro ao buscar projetos:", getErrorMessage(error));
      if (isRefreshing) {
        setProjects([]);
        setCurrentPage(0);
        setHasMoreProjects(false);
      }
    } finally {
      if (isRefreshing) {
        setRefreshingProjects(false);
      } else {
        setLoadingProjects(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects(0, filters, titleFilter);
    } else {
      setProjects([]);
      setCurrentPage(0);
      setHasMoreProjects(true);
    }
  }, [isAuthenticated, filters, titleFilter, fetchProjects]);

  const refreshProjects = useCallback(() => {
    fetchProjects(0, filters, titleFilter);
  }, [fetchProjects, filters, titleFilter]);

  const loadMoreProjects = useCallback(() => {
    if (hasMoreProjects && !loadingProjects && !refreshingProjects) {
      fetchProjects(currentPage, filters, titleFilter);
    }
  }, [hasMoreProjects, loadingProjects, refreshingProjects, currentPage, filters, titleFilter, fetchProjects]);

  const addProject = async (projectData: CreateProjectRequest): Promise<Project> => {
    try {
      const createdProject = await projectService.createProject(projectData);

      const newProject: Project = {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        projectRole: createdProject.projectRole,
        teamMembers: [{ name: user?.name ?? 'Usuário', initials: user?.initials ?? '?' }],
        createdAt: Date.now(),
        taskCount: 0
      };
      setProjects(currentProjects => [newProject, ...currentProjects]);
      return newProject;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const applyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setTitleFilter('');
    setCurrentPage(0);
  }, []);

  const searchByTitle = useCallback((title: string) => {
    setTitleFilter(title);
    setCurrentPage(0);
  }, []);

  return {
    projects,
    loadingProjects,
    refreshingProjects,
    hasMoreProjects,
    addProject,
    loadMoreProjects,
    refreshProjects,
    applyFilters,
    clearFilters,
    searchByTitle,
    filters,
  };
}
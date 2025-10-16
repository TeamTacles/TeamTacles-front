import { useState, useEffect } from 'react';
import { projectService, CreateProjectRequest } from '../services/projectService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { Project } from '../../../types/entities';

export function useProjects(isAuthenticated: boolean) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [refreshingProjects, setRefreshingProjects] = useState(false);

  // Carrega os projetos automaticamente quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Carrega a primeira página ao fazer login
      refreshProjects();
    } else {
      // Limpa os projetos quando faz logout
      setProjects([]);
      setCurrentPage(0);
      setHasMoreProjects(true);
    }
  }, [isAuthenticated]);

  // Pull-to-refresh: Recarrega projetos do zero
  const refreshProjects = async (): Promise<void> => {
    try {
      setRefreshingProjects(true);
      const response = await projectService.getProjects(0, 20);

      // Converte os projetos da API para o formato do front-end
      const projectsFromApi: Project[] = response.content.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        projectRole: project.projectRole,
        teamMembers: [{name: 'Você', initials: 'VC'}],
        createdAt: Date.now()
      }));

      // Atualiza todos os estados
      setProjects(projectsFromApi);
      setCurrentPage(1); // Próxima página será 1
      setHasMoreProjects(!response.last);
    } catch (error) {
      // Em caso de erro, reseta os estados
      setProjects([]);
      setCurrentPage(0);
      setHasMoreProjects(false);
    } finally {
      setRefreshingProjects(false);
    }
  };

  // Infinite scroll: Carrega mais projetos
  const loadMoreProjects = async (): Promise<void> => {
    if (!hasMoreProjects || loadingProjects) return;

    setLoadingProjects(true);
    try {
      const response = await projectService.getProjects(currentPage, 20);

      const newProjects: Project[] = response.content.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        projectRole: project.projectRole,
        teamMembers: [{name: 'Você', initials: 'VC'}],
        createdAt: Date.now()
      }));

      // Adiciona novos projetos aos existentes (não substitui!)
      setProjects(prev => [...prev, ...newProjects]);
      setCurrentPage(prev => prev + 1);
      setHasMoreProjects(!response.last);
    } catch (error) {
      // Silenciosamente falha - o usuário pode tentar novamente
    } finally {
      setLoadingProjects(false);
    }
  };

  const addProject = async (projectData: CreateProjectRequest): Promise<Project> => {
    try {
      // Chama a API para criar o projeto
      const createdProject = await projectService.createProject(projectData);

      // Adiciona o projeto criado à lista local
      const newProject: Project = {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        projectRole: createdProject.projectRole,
        teamMembers: [{name: 'Você', initials: 'VC'}],
        createdAt: Date.now()
      };

      setProjects(currentProjects => [newProject, ...currentProjects]);

      // Retorna o projeto criado para uso posterior (ex: convites)
      return newProject;
    } catch (error) {
      // Propaga o erro para ser tratado no componente que chamou
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  return {
    projects,
    loadingProjects,
    refreshingProjects,
    hasMoreProjects,
    addProject,
    loadMoreProjects,
    refreshProjects,
  };
}

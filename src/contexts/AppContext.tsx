import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnUnauthorizedCallback } from '../services/api';
import { login as loginService } from '../services/authService';
import { LoginData } from '../types/AuthTypes';
import { projectService, CreateProjectRequest } from '../services/projectService';
import { getErrorMessage } from '../utils/errorHandler'; 

// --- TIPOS ALINHADOS COM OS DTOs JAVA ---

// Representa um membro simplificado para exibição nos cards
interface Member {
  name: string;
  initials: string;
}

// Baseado em UserProjectResponseDTO e ProjectResponseDTO
export interface Project {
  id: number;
  title: string;
  description: string;
  // Opcional: Adicionar projectRole se a API o retornar na lista principal
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  // Mantido para exibição no card, mas será populado no front-end
  teamMembers: Member[]; 
  createdAt: number; // Corresponde ao createdAt do back-end
}

// Baseado em UserTeamResponseDTO e TeamResponseDTO
export interface Team {
    id: number;
    name: string; // DTO usa 'name', não 'title'
    description: string;
    teamRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
    members: Member[];
    createdAt: number;
}

// Baseado em TaskResponseDTO
export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string; // OffsetDateTime vira string
  projectId: number;
  projectName: string; // Campo de conveniência para o front-end
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  createdAt: number; // OffsetDateTime vira timestamp
}

interface AppContextType {
  signed: boolean;
  loading: boolean;
  signIn(credentials: LoginData): Promise<void>;
  signOut(): void;

  projects: Project[];
  teams: Team[];
  tasks: Task[];
  loadingProjects: boolean;
  refreshingProjects: boolean;
  hasMoreProjects: boolean;
  // Funções de projetos
  addProject: (project: CreateProjectRequest) => Promise<void>;
  loadMoreProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  // Funções de tarefas
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE PAGINAÇÃO DE PROJETOS ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [refreshingProjects, setRefreshingProjects] = useState(false);

  // --- OUTROS DADOS DA API ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);


  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem('@TeamTacles:token');
      if (storedToken) {
        setToken(storedToken);
      }
      setLoading(false);
    }
    loadStorageData();

    // Configura o callback para quando o token expirar (401)
    setOnUnauthorizedCallback(() => {
      setToken(null);
    });
  }, []);

  // Carrega os projetos automaticamente quando o usuário estiver autenticado
  useEffect(() => {
    if (token) {
      // Carrega a primeira página ao fazer login
      refreshProjects();
    } else {
      // Limpa os projetos quando faz logout
      setProjects([]);
      setCurrentPage(0);
      setHasMoreProjects(true);
    }
  }, [token]);

  async function signIn(credentials: LoginData) {
    const response = await loginService(credentials);
    const { token: newToken } = response;

    setToken(newToken);
    await AsyncStorage.setItem('@TeamTacles:token', newToken);
  }

  async function signOut() {
    await AsyncStorage.clear();
    setToken(null);
  }

  // --- FUNÇÕES DE MANIPULAÇÃO DE PROJETOS ---

  // Pull-to-refresh: Recarrega projetos do zero
  const refreshProjects = async (): Promise<void> => {
    setRefreshingProjects(true);
    try {
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

      // Substitui toda a lista
      setProjects(projectsFromApi);
      setCurrentPage(1); // Próxima página será 1
      setHasMoreProjects(!response.last);
    } catch (error) {
      console.error('Erro ao atualizar projetos:', error);
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
      console.error('Erro ao carregar mais projetos:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const addProject = async (projectData: CreateProjectRequest): Promise<void> => {
    try {
      // Chama a API para criar o projeto
      const createdProject = await projectService.createProject(projectData);

      // Adiciona o projeto criado à lista local
      const newProject: Project = {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        teamMembers: [{name: 'Você', initials: 'VC'}], 
        createdAt: Date.now() 
      };

      setProjects(currentProjects => [newProject, ...currentProjects]);
    } catch (error) {
      // Propaga o erro para ser tratado no componente que chamou
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const now = Date.now();
    const newTask: Task = { 
        id: now, 
        ...taskData, 
        status: 'TO_DO', 
        createdAt: now 
    };
    setTasks(currentTasks => [newTask, ...currentTasks]);
  };

  return (
    <AppContext.Provider
      value={{
        signed: !!token,
        loading,
        signIn,
        signOut,
        projects,
        teams,
        tasks,
        loadingProjects,
        refreshingProjects,
        hasMoreProjects,
        addProject,
        loadMoreProjects,
        refreshProjects,
        addTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('o useAppContext deve ser usado dentro de um AppProvider.');
  }
  return context;
};
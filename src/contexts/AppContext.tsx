import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnUnauthorizedCallback } from '../services/api';
import { login as loginService } from '../services/authService';
import { LoginData } from '../types/AuthTypes'; 

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
  teams: Team[]; // Adicionado
  tasks: Task[];
  // Funções de 'add' serão ajustadas para simular a criação com tipos corretos
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'teamMembers'>) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- DADOS MOCADOS COM TIPOS CORRIGIDOS ---

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1, // number
      title: 'Website Redesign',
      description: 'Renovação completa do site.',
      teamMembers: [{ name: 'Caio Dib', initials: 'CD' }, { name: 'João Victor', initials: 'JV' }],
      createdAt: new Date('2025-08-10').getTime()
    }
  ]);

  const [teams, setTeams] = useState<Team[]>([]); // Inicializado vazio por enquanto
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

  // --- FUNÇÕES DE CRIAÇÃO ATUALIZADAS ---

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'teamMembers'>) => {
    const now = Date.now();
    const newProject: Project = { 
        id: now, // Gera um ID numérico
        ...projectData, 
        teamMembers: [{name: 'Usuário Atual', initials: 'UA'}], // Simula o criador como membro
        createdAt: now 
    };
    setProjects(currentProjects => [newProject, ...currentProjects]);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const now = Date.now();
    const newTask: Task = { 
        id: now, // Gera um ID numérico
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
        teams, // Exposto no contexto
        tasks,
        addProject,
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
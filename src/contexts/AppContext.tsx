import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api'; 
import { login as loginService } from '../services/authService';
import { LoginData } from '../types/AuthTypes'; 

interface Member {
  name: string;
  initials: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  teamMembers: Member[];
  lastUpdated: number;
  createdAt: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  projectId: string;
  projectName: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  createdAt: number;
}

interface AppContextType {
  signed: boolean;
  loading: boolean;
  signIn(credentials: LoginData): Promise<void>;
  signOut(): void;

  projects: Project[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'lastUpdated' | 'createdAt'>) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Renovação completa do site.',
      teamMembers: [{ name: 'Caio Dib', initials: 'CD' }, { name: 'João Victor', initials: 'JV' }],
      lastUpdated: new Date('2025-09-28').getTime(),
      createdAt: new Date('2025-08-10').getTime()
    }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);


  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem('@TeamTacles:token');
      if (storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  async function signIn(credentials: LoginData) {
    const response = await loginService(credentials);
    const { token: newToken } = response;

    setToken(newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await AsyncStorage.setItem('@TeamTacles:token', newToken);
  }

  async function signOut() {
    await AsyncStorage.clear();
    setToken(null);
  }

  const addProject = (projectData: Omit<Project, 'id' | 'lastUpdated' | 'createdAt'>) => {
    const now = Date.now();
    const newProject: Project = { id: String(now), ...projectData, lastUpdated: now, createdAt: now };
    setProjects(currentProjects => [newProject, ...currentProjects]);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = { id: String(Date.now()), ...taskData, status: 'TO_DO', createdAt: Date.now() };
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
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';

interface Project {
  id: string;
  title: string;
  description: string;
  teamMembers: string[];
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
  projects: Project[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'lastUpdated' | 'createdAt'>) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([
    { 
      id: '1', 
      title: 'Website Redesign', 
      description: 'Renovação completa do site.', 
      teamMembers: ['CD', 'JV'], 
      lastUpdated: new Date('2025-09-28').getTime(), 
      createdAt: new Date('2025-08-10').getTime()   
    }
  ]);
  const [tasks, setTasks] = useState<Task[]>([
      { id: '101', title: 'Criar wireframes', description: '', dueDate: '15 de out, 2025', projectId: '1', projectName: 'Website Redesign', status: 'DONE', createdAt: new Date('2025-09-01').getTime() },
      { id: '102', title: 'Desenvolver API de login', description: '', dueDate: '25 de out, 2025', projectId: '1', projectName: 'Website Redesign', status: 'IN_PROGRESS', createdAt: new Date('2025-09-15').getTime() },
  ]);

  const addProject = (projectData: Omit<Project, 'id' | 'lastUpdated' | 'createdAt'>) => {
    const now = Date.now();
    const newProject: Project = {
      id: String(now),
      ...projectData,
      lastUpdated: now, 
      createdAt: now,
    };
    setProjects(currentProjects => [newProject, ...currentProjects]);
    Alert.alert('Sucesso!', `Projeto "${projectData.title}" criado.`);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      id: String(Date.now()),
      ...taskData,
      status: 'TO_DO',
      createdAt: Date.now(),
    };
    setTasks(currentTasks => [newTask, ...currentTasks]);
    Alert.alert('Sucesso!', `Tarefa "${taskData.title}" criada.`);
  };

  return (
    <AppContext.Provider value={{ projects, tasks, addProject, addTask }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('O useAppContext deve ser usado dentro de um AppProvider.');
  }
  return context;
};
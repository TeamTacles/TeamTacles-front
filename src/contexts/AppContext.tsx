import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';

interface Project {
  id: string;
  title: string;
  description: string;
  teamMembers: string[];
  lastUpdated: number; 
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  projectId: string; 
  projectName: string;
}

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'lastUpdated'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const addProject = (projectData: Omit<Project, 'id' | 'lastUpdated'>) => {
    const newProject: Project = {
      id: String(Date.now()),
      ...projectData,
      lastUpdated: Date.now(), 
    };
    setProjects(currentProjects => [newProject, ...currentProjects]);
    Alert.alert('Sucesso!', `Projeto "${projectData.title}" criado.`);
  };


  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: String(Date.now()),
      ...taskData,
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
import React, { createContext, useState, useContext, ReactNode } from 'react';

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
      teamMembers: [{ name: 'Caio Dib', initials: 'CD' }, { name: 'João Victor', initials: 'JV' }],
      lastUpdated: new Date('2025-09-28').getTime(),
      createdAt: new Date('2025-08-10').getTime()
    }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const addProject = (projectData: Omit<Project, 'id' | 'lastUpdated' | 'createdAt'>) => {
    const now = Date.now();
    const newProject: Project = {
      id: String(now),
      ...projectData,
      lastUpdated: now,
      createdAt: now,
    };
    setProjects(currentProjects => [newProject, ...currentProjects]);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      id: String(Date.now()),
      ...taskData,
      status: 'TO_DO',
      createdAt: Date.now(),
    };
    setTasks(currentTasks => [newTask, ...currentTasks]);
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
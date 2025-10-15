import { useState } from 'react';

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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

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

  return {
    tasks,
    addTask,
  };
}

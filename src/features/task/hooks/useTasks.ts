import { useState } from 'react';
import { Task } from '../../../types/entities';

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

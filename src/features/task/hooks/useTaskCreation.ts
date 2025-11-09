import { useState } from 'react';
import { taskService, TaskCreateResponse, TaskAssignmentRequest } from '../services/taskService';
import { ProjectTask } from '../../project/services/projectService';
import { useNotification } from '../../../contexts/NotificationContext';
import { getErrorMessage } from '../../../utils/errorHandler';

interface UseTaskCreationParams {
  projectId?: number;
  onTaskCreated: (task: ProjectTask) => void;
}

interface NewTaskData {
  title: string;
  description: string;
  dueDate: Date;
}

export function useTaskCreation({ projectId, onTaskCreated }: UseTaskCreationParams) {
  const { showNotification } = useNotification();

  const [isNewTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [isSelectMembersModalVisible, setSelectMembersModalVisible] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData | null>(null);
  const [isCreatingTask, setCreatingTask] = useState(false);

  const handleProceedToMemberSelection = (data: NewTaskData) => {
    setNewTaskData(data);
    setNewTaskModalVisible(false);
    setSelectMembersModalVisible(true);
  };

  const convertToProjectTask = (response: TaskCreateResponse): ProjectTask => {
    return {
      id: response.id,
      title: response.title,
      description: response.description,
      status: response.status,
      dueDate: response.dueDate,
      ownerId: response.ownerId,
      assignments: response.assignments.map(a => ({
        userId: a.userId,
        username: a.username,
      })),
    };
  };

  const handleFinalizeTaskCreation = async (selectedMemberIds: number[]) => {
    if (!newTaskData) {
      showNotification({ type: 'error', message: 'Dados da tarefa não encontrados.' });
      return;
    }

    if (!projectId) {
      showNotification({ type: 'error', message: 'Projeto não encontrado.' });
      return;
    }

    try {
      setCreatingTask(true);

      // Formata a data/hora para ISO 8601 UTC (formato padrão: "YYYY-MM-DDTHH:mm:ss.sssZ")
      const formattedDueDate = newTaskData.dueDate.toISOString();

      // Chama a API para criar a task
      const newTaskResponse = await taskService.createTask(projectId, {
        title: newTaskData.title,
        description: newTaskData.description,
        dueDate: formattedDueDate,
      });

      let finalTaskResponse = newTaskResponse;
      if (selectedMemberIds.length > 0) {
        const assignmentsPayload: TaskAssignmentRequest[] = selectedMemberIds.map(id => ({
          userId: id,
          taskRole: 'ASSIGNEE',
        }));

        const updatedTaskResponse = await taskService.assignUsersToTask(
          projectId,
          newTaskResponse.id,
          assignmentsPayload
        );

        finalTaskResponse = {
          ...newTaskResponse,
          assignments: updatedTaskResponse.assignments,
        };
      }

      const newTask = convertToProjectTask(finalTaskResponse);

      onTaskCreated(newTask);

      setSelectMembersModalVisible(false);
      setNewTaskData(null);

      showNotification({ type: 'success', message: 'Tarefa criada com sucesso!' });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      showNotification({ type: 'error', message: errorMessage });
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCloseSelectMembersModal = () => {
    setSelectMembersModalVisible(false);
    if (newTaskData) {
      handleFinalizeTaskCreation([]);
    }
  };

  const handleOpenNewTaskModal = () => {
    setNewTaskModalVisible(true);
  };

  const handleCancelCreation = () => {
    setNewTaskModalVisible(false);
    setSelectMembersModalVisible(false);
    setNewTaskData(null);
  };

  return {
    isNewTaskModalVisible,
    setNewTaskModalVisible,
    isSelectMembersModalVisible,
    isCreatingTask,

    handleOpenNewTaskModal,
    handleProceedToMemberSelection,
    handleFinalizeTaskCreation,
    handleCloseSelectMembersModal,
    handleCancelCreation,
  };
}

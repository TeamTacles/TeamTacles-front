import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskAssignmentRequest } from '../services/taskService';
import { ProjectTask } from '../../project/services/projectService';
import { useNotification } from '../../../contexts/NotificationContext';
import { getErrorMessage } from '../../../utils/errorHandler';

interface UseTaskCreationParams {
  projectId?: number;
  onTaskCreated?: (task: ProjectTask) => void; 
}

interface NewTaskData {
  title: string;
  description: string;
  dueDate: Date;
}

export function useTaskCreation({ projectId, onTaskCreated }: UseTaskCreationParams) {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [isNewTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [isSelectMembersModalVisible, setSelectMembersModalVisible] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData | null>(null);

  const createTaskMutation = useMutation({
    mutationFn: async (params: { data: NewTaskData; memberIds: number[] }) => {
      if (!projectId) throw new Error("ID do projeto ausente.");

      const formattedDueDate = params.data.dueDate.toISOString();
      const newTaskResponse = await taskService.createTask(projectId, {
        title: params.data.title,
        description: params.data.description,
        dueDate: formattedDueDate,
      });

      let finalTaskResponse = newTaskResponse;
      if (params.memberIds.length > 0) {
        const assignmentsPayload: TaskAssignmentRequest[] = params.memberIds.map(id => ({
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
            assignments: updatedTaskResponse.assignments
        };
      }

      return finalTaskResponse;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      }

      showNotification({ type: 'success', message: 'Tarefa criada com sucesso!' });

      setSelectMembersModalVisible(false);
      setNewTaskData(null);
      
      if (onTaskCreated) {
        const projectTask: ProjectTask = {
          id: response.id,
          title: response.title,
          description: response.description,
          status: response.status,
          dueDate: response.dueDate,
          ownerId: response.ownerId,
          projectId: projectId!,
          assignments: response.assignments.map(a => ({
            userId: a.userId,
            username: a.username,
          })),
        };
        onTaskCreated(projectTask);
      }
    },
    onError: (error) => {
      showNotification({ type: 'error', message: getErrorMessage(error) });
    }
  });


  const handleProceedToMemberSelection = (data: NewTaskData) => {
    setNewTaskData(data);
    setNewTaskModalVisible(false);
    setSelectMembersModalVisible(true);
  };

  const handleFinalizeTaskCreation = (selectedMemberIds: number[]) => {
    if (!newTaskData) {
      showNotification({ type: 'error', message: 'Dados da tarefa não encontrados.' });
      return;
    }
    createTaskMutation.mutate({ data: newTaskData, memberIds: selectedMemberIds });
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
    
    isCreatingTask: createTaskMutation.isPending,

    handleOpenNewTaskModal,
    handleProceedToMemberSelection,
    handleFinalizeTaskCreation,
    handleCloseSelectMembersModal,
    handleCancelCreation,
  };
}

// src/features/task/hooks/useTaskCreation.ts
import { useState } from 'react';
import { taskService, formatDateTimeWithOffset, TaskCreateResponse } from '../services/taskService';
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

  // Estados de modais
  const [isNewTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [isSelectMembersModalVisible, setSelectMembersModalVisible] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData | null>(null);
  const [isCreatingTask, setCreatingTask] = useState(false);

  // Handler: NewTaskModal -> SelectTaskMembersModal
  const handleProceedToMemberSelection = (data: NewTaskData) => {
    setNewTaskData(data);
    setNewTaskModalVisible(false);
    setSelectMembersModalVisible(true);
  };

  // Função auxiliar para converter TaskCreateResponse em ProjectTask
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

  // Handler: Finalizar criação da task (integrado com backend)
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

      // Formata a data/hora com offset timezone (formato ISO 8601 completo)
      const formattedDueDate = formatDateTimeWithOffset(newTaskData.dueDate);

      // Chama a API para criar a task
      const newTaskResponse = await taskService.createTask(projectId, {
        title: newTaskData.title,
        description: newTaskData.description,
        dueDate: formattedDueDate,
      });

      // Converte a resposta do backend para o formato ProjectTask (usado na UI)
      const newTask = convertToProjectTask(newTaskResponse);

      // Callback para adicionar a task na lista (componente pai)
      onTaskCreated(newTask);

      // Fecha o modal e limpa dados temporários
      setSelectMembersModalVisible(false);
      setNewTaskData(null);

      // Mostra notificação de sucesso
      showNotification({ type: 'success', message: 'Tarefa criada com sucesso!' });
    } catch (error: any) {
      // Mostra mensagem de erro apropriada
      const errorMessage = getErrorMessage(error);
      showNotification({ type: 'error', message: errorMessage });
    } finally {
      setCreatingTask(false);
    }
  };

  // Handler: Fechar SelectTaskMembersModal sem salvar
  const handleCloseSelectMembersModal = () => {
    setSelectMembersModalVisible(false);
    // Se fechar sem salvar, cria a task sem membros selecionados
    if (newTaskData) {
      handleFinalizeTaskCreation([]);
    }
  };

  // Handler: Abrir modal de criação de task
  const handleOpenNewTaskModal = () => {
    setNewTaskModalVisible(true);
  };

  // Handler: Cancelar criação completamente (fechar ambos os modais e limpar dados)
  const handleCancelCreation = () => {
    setNewTaskModalVisible(false);
    setSelectMembersModalVisible(false);
    setNewTaskData(null);
  };

  return {
    // Estados de modais
    isNewTaskModalVisible,
    setNewTaskModalVisible,
    isSelectMembersModalVisible,
    isCreatingTask,

    // Handlers
    handleOpenNewTaskModal,
    handleProceedToMemberSelection,
    handleFinalizeTaskCreation,
    handleCloseSelectMembersModal,
    handleCancelCreation,
  };
}

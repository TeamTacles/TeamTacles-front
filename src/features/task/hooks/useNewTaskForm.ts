import { useState } from 'react';

interface NewTaskFormData {
  title: string;
  description: string;
  dueDate: Date;
}

export function useNewTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [isInfoPopupVisible, setInfoPopupVisible] = useState(false);
  const [infoPopupMessage, setInfoPopupMessage] = useState('');

  const handleNext = (onNext: (data: NewTaskFormData) => void) => {
    if (!title.trim()) {
      setInfoPopupMessage('O título da tarefa é obrigatório.');
      setInfoPopupVisible(true);
      return;
    }

    // Combina a data e hora selecionadas em um único objeto Date
    const combinedDateTime = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
      dueTime.getHours(),
      dueTime.getMinutes(),
      0, // segundos
      0  // milissegundos
    );

    if (combinedDateTime <= new Date()) {
      setInfoPopupMessage('A data e hora devem ser no futuro.');
      setInfoPopupVisible(true);
      return;
    }

    onNext({ title, description, dueDate: combinedDateTime });
  };

  // Reset do formulário
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setDueTime(new Date());
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    isInfoPopupVisible,
    setInfoPopupVisible,
    infoPopupMessage,

    handleNext,
    resetForm,
  };
}

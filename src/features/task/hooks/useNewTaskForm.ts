// src/features/task/hooks/useNewTaskForm.ts
import { useState } from 'react';
import { Platform } from 'react-native';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface NewTaskFormData {
  title: string;
  description: string;
  dueDate: Date;
}

export function useNewTaskForm() {
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());

  // Estados de UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estados de validação/erro
  const [isInfoPopupVisible, setInfoPopupVisible] = useState(false);
  const [infoPopupMessage, setInfoPopupMessage] = useState('');

  // Handler para validar e combinar data+hora
  const handleNext = (onNext: (data: NewTaskFormData) => void) => {
    // Validação: título obrigatório
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

    // Validação: data e hora devem ser no futuro
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

  // Handler de mudança de data
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set') {
      setDueDate(currentDate);
    }
  };

  // Handler de mudança de hora
  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || dueTime;
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'set') {
      setDueTime(currentTime);
    }
  };

  // Formatação de data para display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Formatação de hora para display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return {
    // Estados
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    dueTime,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    isInfoPopupVisible,
    setInfoPopupVisible,
    infoPopupMessage,

    // Handlers
    handleNext,
    resetForm,
    handleDateChange,
    handleTimeChange,

    // Formatters
    formatDate,
    formatTime
  };
}

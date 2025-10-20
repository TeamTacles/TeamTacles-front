// src/components/NewTaskModal.tsx
import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Platform } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { InfoPopup } from '../../../components/common/InfoPopup';
import { useNewTaskForm } from '../hooks/useNewTaskForm';

// Injeta CSS customizado para os inputs de data/hora no web
const injectDateTimeStyles = () => {
    if (Platform.OS !== 'web') return;

    const styleId = 'datetime-picker-custom-styles';
    if (document.getElementById(styleId)) return; // Já foi injetado

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .date-input-custom::-webkit-calendar-picker-indicator,
        .time-input-custom::-webkit-calendar-picker-indicator {
            filter: invert(55%) sepia(94%) saturate(2571%) hue-rotate(351deg) brightness(98%) contrast(89%);
            cursor: pointer;
        }

        .date-input-custom::-webkit-calendar-picker-indicator:hover,
        .time-input-custom::-webkit-calendar-picker-indicator:hover {
            filter: invert(65%) sepia(94%) saturate(2571%) hue-rotate(351deg) brightness(108%) contrast(89%);
        }
    `;
    document.head.appendChild(style);
};

interface NewTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onNext: (data: { title: string; description: string; dueDate: Date }) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ visible, onClose, onNext }) => {
    const {
        title,
        setTitle,
        description,
        setDescription,
        dueDate,
        setDueDate,
        dueTime,
        setDueTime,
        showDatePicker,
        setShowDatePicker,
        showTimePicker,
        setShowTimePicker,
        isInfoPopupVisible,
        setInfoPopupVisible,
        infoPopupMessage,
        handleNext,
        resetForm,
        handleDateChange,
        handleTimeChange,
        formatDate,
        formatTime
    } = useNewTaskForm();

    // Injeta estilos CSS customizados no web
    useEffect(() => {
        injectDateTimeStyles();
    }, []);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Icon name="close-outline" size={30} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Criar Nova Tarefa</Text>
                        <ScrollView>
                            <InputsField
                                label="Título da Tarefa *"
                                placeholder='Digite o nome da tarefa'
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                            <InputsField
                                label="Descrição"
                                placeholder='Descreva os detalhes da tarefa'
                                value={description}
                                onChangeText={setDescription}
                                multiline={true}
                                numberOfLines={4}
                                maxLength={500}
                            />
                            {Platform.OS === 'web' ? (
                                <>
                                    <Text style={styles.inputLabel}>Data do Prazo *</Text>
                                    <input
                                        type="date"
                                        value={dueDate.toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            const newDate = new Date(e.target.value + 'T00:00:00');
                                            setDueDate(newDate);
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="date-input-custom"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            paddingRight: '40px',
                                            backgroundColor: '#1E1E1E',
                                            color: '#FFFFFF',
                                            border: '1px solid #3C3C3C',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            marginBottom: '16px',
                                            boxSizing: 'border-box',
                                            fontFamily: 'system-ui, -apple-system, sans-serif',
                                            colorScheme: 'dark'
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Pressable onPress={() => setShowDatePicker(true)}>
                                        <View pointerEvents="none">
                                            <InputsField
                                                label="Data do Prazo *"
                                                value={formatDate(dueDate)}
                                            />
                                        </View>
                                    </Pressable>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            mode="date"
                                            display="default"
                                            value={dueDate}
                                            onChange={handleDateChange}
                                            minimumDate={new Date()}
                                        />
                                    )}
                                </>
                            )}

                            {Platform.OS === 'web' ? (
                                <>
                                    <Text style={styles.inputLabel}>Hora do Prazo *</Text>
                                    <input
                                        type="time"
                                        value={`${String(dueTime.getHours()).padStart(2, '0')}:${String(dueTime.getMinutes()).padStart(2, '0')}`}
                                        onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(':');
                                            const newTime = new Date();
                                            newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                            setDueTime(newTime);
                                        }}
                                        className="time-input-custom"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            paddingRight: '40px',
                                            backgroundColor: '#1E1E1E',
                                            color: '#FFFFFF',
                                            border: '1px solid #3C3C3C',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            marginBottom: '16px',
                                            boxSizing: 'border-box',
                                            fontFamily: 'system-ui, -apple-system, sans-serif',
                                            colorScheme: 'dark'
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Pressable onPress={() => setShowTimePicker(true)}>
                                        <View pointerEvents="none">
                                            <InputsField
                                                label="Hora do Prazo *"
                                                value={formatTime(dueTime)}
                                            />
                                        </View>
                                    </Pressable>
                                    {showTimePicker && (
                                        <DateTimePicker
                                            mode="time"
                                            display="default"
                                            value={dueTime}
                                            onChange={handleTimeChange}
                                        />
                                    )}
                                </>
                            )}

                        </ScrollView>
                        <View style={styles.buttonContainer}>
                          <MainButton
                            title="Avançar"
                            onPress={() => handleNext(onNext)}
                          />
                        </View>
                    </View>
                </View>
            </Modal>

            <InfoPopup
                visible={isInfoPopupVisible}
                title="Atenção"
                message={infoPopupMessage}
                onClose={() => setInfoPopupVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalView: {
        height: Platform.OS === 'web' ? '90%' : 'auto',
        maxHeight: '90%',
        width: '90%',
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    buttonContainer: { marginTop: 20, },
    inputLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8
    }
});

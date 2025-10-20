// src/components/NewTaskModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { InfoPopup } from '../../../components/common/InfoPopup';
import { useNewTaskForm } from '../hooks/useNewTaskForm';

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
        dueTime,
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
    modalView: { maxHeight: '85%', width: '90%', backgroundColor: '#2A2A2A', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    buttonContainer: { marginTop: 20, }
});

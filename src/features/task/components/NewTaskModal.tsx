import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import { InfoPopup } from '../../../components/common/InfoPopup';
import { DatePickerField } from '../../../components/common/DatePickerField';
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
        setDueDate,
        dueTime,
        setDueTime,
        isInfoPopupVisible,
        setInfoPopupVisible,
        infoPopupMessage,
        handleNext,
        resetForm,
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
                            <DatePickerField
                                mode="date"
                                value={dueDate}
                                onChange={setDueDate}
                                label="Data do Prazo *"
                                minDate={new Date()}
                            />
                            <DatePickerField
                                mode="time"
                                value={dueTime}
                                onChange={setDueTime}
                                label="Hora do Prazo *"
                            />

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
});

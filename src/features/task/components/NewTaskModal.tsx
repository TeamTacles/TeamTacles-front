// src/components/NewTaskModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Pressable } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { InfoPopup } from '../../../components/common/InfoPopup'; // 1. Importar o InfoPopup

interface NewTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onNext: (data: { title: string; description: string; dueDate: Date }) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ visible, onClose, onNext }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    // 2. Adicionar estado para controlar o popup
    const [isInfoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupMessage, setInfoPopupMessage] = useState('');


    const handleNext = () => {
        // 3. Substituir o alert() pelo InfoPopup
        if (!title.trim()) {
            setInfoPopupMessage('O título da tarefa é obrigatório.');
            setInfoPopupVisible(true);
            return;
        }
        onNext({ title, description, dueDate });
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setDueDate(new Date());
        onClose();
    }

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || dueDate;
        setShowPicker(Platform.OS === 'ios');
        if (event.type === 'set') {
            setDueDate(currentDate);
        }
    };
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
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
                            <Pressable onPress={() => setShowPicker(true)}>
                                <View pointerEvents="none">
                                    <InputsField
                                        label="Prazo *"
                                        value={formatDate(dueDate)}
                                    />
                                </View>
                            </Pressable>

                            {showPicker && (
                                <DateTimePicker
                                    mode="date"
                                    display="default"
                                    value={dueDate}
                                    onChange={onDateChange}
                                    minimumDate={new Date()}
                                />
                            )}

                        </ScrollView>
                        <View style={styles.buttonContainer}>
                          <MainButton
                            title="Avançar"
                            onPress={handleNext}
                          />
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* 4. Adicionar o componente InfoPopup */}
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
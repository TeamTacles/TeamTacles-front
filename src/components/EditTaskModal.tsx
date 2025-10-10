// src/components/EditTaskModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from './MainButton';
import { InputsField } from './InputsField';
import Icon from 'react-native-vector-icons/Ionicons';

interface TaskData {
  title: string;
  description: string;
}

interface EditTaskModalProps {
  visible: boolean;
  task: TaskData | null;
  onClose: () => void;
  onSave: (updatedData: { title: string; description: string }) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, task, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
        }
    }, [task]);

    const handleSave = () => {
        onSave({ title, description });
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Editar Tarefa</Text>
                    <ScrollView>
                        <InputsField
                            label="Título da Tarefa"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <InputsField
                            label="Descrição"
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}      
                            numberOfLines={4}  
                            maxLength={500}     
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton title="Salvar Alterações" onPress={handleSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalView: { maxHeight: '80%', width: '90%', backgroundColor: '#2A2A2A', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    buttonContainer: { marginTop: 20 }
});
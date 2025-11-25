import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'; 
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
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
  onDelete: () => void; 
  isSaving?: boolean; 
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
    visible,
    task,
    onClose,
    onSave,
    onDelete,
    isSaving = false 
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const isInitialized = useRef(false);

    useEffect(() => {
        if (task && !isInitialized.current) {
            setTitle(task.title);
            setDescription(task.description);
            isInitialized.current = true;
        }
    }, [task]);

    const handleSave = () => {
        onSave({ title, description });
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isSaving}>
                        <Icon name="close-outline" size={30} color={isSaving ? "#555" : "#fff"} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Editar Tarefa</Text>
                    <ScrollView>
                        <InputsField
                            label="Título da Tarefa"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                            editable={!isSaving} 
                        />
                        <InputsField
                            label="Descrição"
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={4}
                            maxLength={500}
                            editable={!isSaving} 
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={isSaving ? "Salvando..." : "Salvar Alterações"}
                        onPress={handleSave}
                        disabled={isSaving}
                      />
                    </View>

                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={[styles.deleteButton, isSaving && styles.disabledButton]} 
                        onPress={onDelete}
                        disabled={isSaving} 
                    >
                        <Icon name="trash-outline" size={20} color={isSaving ? "#888" : "#ff4545"} />
                        <Text style={[styles.deleteButtonText, isSaving && styles.disabledText]}>Excluir Tarefa</Text>
                    </TouchableOpacity>
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
    buttonContainer: { marginTop: 20 },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#4A4A4A',
        marginVertical: 20,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    deleteButtonText: {
        color: '#ff4545',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: '#888',
    },
});
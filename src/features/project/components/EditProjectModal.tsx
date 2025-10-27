// src/components/EditProjectModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProjectDetails } from '../services/projectService'; // Usando o tipo de detalhes do projeto

interface EditProjectModalProps {
  visible: boolean;
  project: ProjectDetails | null;
  onClose: () => void;
  onSave: (updatedData: { title: string; description: string }) => void;
  onDelete: () => void; // A função para deletar
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ visible, project, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    // O estado para o modal de confirmação foi movido para a tela principal

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description);
        }
    }, [project]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = "O título do projeto é obrigatório.";
        } else if (title.trim().length < 3) {
            newErrors.title = "O título deve ter pelo menos 3 caracteres.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'title') setTitle(value);
        if (field === 'description') setDescription(value);

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSave = () => {
        if (!validateForm()) return;
        onSave({ title, description });
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Editar Projeto</Text>
                    <ScrollView>
                        <InputsField
                            label="Título do Projeto"
                            value={title}
                            onChangeText={(text) => handleInputChange('title', text)}
                            maxLength={50}
                            error={errors.title}
                        />
                        <InputsField
                            label="Descrição"
                            value={description}
                            onChangeText={(text) => handleInputChange('description', text)}
                            multiline={true}
                            numberOfLines={4}
                            maxLength={250}
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton title="Salvar Alterações" onPress={handleSave} />
                    </View>

                    {/* Seção para deletar o projeto */}
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                        <Icon name="trash-outline" size={20} color="#ff4545" />
                        <Text style={styles.deleteButtonText}>Excluir Projeto</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)' 
    },
    modalView: { 
        maxHeight: '80%', 
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
    modalTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#FFFFFF', 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    closeButton: { 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        padding: 5, 
        zIndex: 1 
    },
    buttonContainer: {
      marginTop: 10, 
    },
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
});
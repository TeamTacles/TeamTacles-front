// src/components/EditTeamModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import { TeamType } from '../../../types/entities';

interface EditTeamModalProps {
  visible: boolean;
  team: TeamType | null;
  onClose: () => void;
  onSave: (updatedData: { title: string; description: string }) => void;
  onDelete: () => void;
  isOwner: boolean; // Prop para saber se o usuário é o dono
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({ visible, team, onClose, onSave, onDelete, isOwner }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (team) {
            setTitle(team.title || '');
            setDescription(team.description || '');
        }
    }, [team]);

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
                    <Text style={styles.modalTitle}>Editar Equipe</Text>
                    <ScrollView>
                        <InputsField
                            label="Título da Equipe"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={50}
                        />
                        <InputsField
                            label="Descrição"
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}      
                            numberOfLines={4}  
                            maxLength={250}     
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton title="Salvar Alterações" onPress={handleSave} />
                    </View>

                    {/* Botão de deletar só aparece para o Dono */}
                    {isOwner && (
                        <>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                                <Icon name="trash-outline" size={20} color="#ff4545" />
                                <Text style={styles.deleteButtonText}>Excluir Equipe</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
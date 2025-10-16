// src/components/NewProjectModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';

interface NewProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string }) => void;
  isCreating: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ visible, onClose, onCreate, isCreating }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = () => {
        onCreate({ title, description });
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        onClose();
    }

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Criar Novo Projeto</Text>
                    <ScrollView>
                        <InputsField
                            label="Título do Projeto *"
                            placeholder='Digite o nome do projeto'
                            value={title}
                            onChangeText={setTitle}
                            maxLength={50}
                        />
                        <InputsField
                            label="Descrição"
                            placeholder='Descreva o objetivo do projeto'
                            value={description}
                            onChangeText={setDescription} // <-- CORREÇÃO: Esta linha foi adicionada
                            multiline={true}
                            numberOfLines={4}
                            maxLength={250}
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={isCreating ? "Criando..." : "Criar Projeto"}
                        onPress={handleCreate}
                        disabled={isCreating}
                      />
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
    buttonContainer: { marginTop: 20, }
});
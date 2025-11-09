import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';

interface NewTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onNext: (data: { title: string; description: string }) => void;
  isCreating: boolean;
}

export const NewTeamModal: React.FC<NewTeamModalProps> = ({ visible, onClose, onNext, isCreating }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = "O título da equipe é obrigatório.";
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

    const handleNext = () => {
        if (!validateForm()) return;
        onNext({ title, description });
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setErrors({});
        onClose();
    }

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Criar Nova Equipe</Text>
                    <ScrollView>
                        <InputsField
                            label="Título da Equipe *"
                            placeholder='Digite o nome da equipe'
                            value={title}
                            onChangeText={(text) => handleInputChange('title', text)}
                            maxLength={50}
                            error={errors.title}
                        />
                        <InputsField
                            label="Descrição"
                            placeholder='Descreva o objetivo da equipe'
                            value={description}
                            onChangeText={(text) => handleInputChange('description', text)}
                            multiline={true}
                            numberOfLines={4}
                            maxLength={250}
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={isCreating ? "Criando..." : "Avançar"}
                        onPress={handleNext}
                        disabled={isCreating}
                      />
                    </View>
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
      marginTop: 20,
    }
});
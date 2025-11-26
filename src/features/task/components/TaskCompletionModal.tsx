import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';

interface TaskCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isSaving?: boolean;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
    visible,
    onClose,
    onConfirm,
    isSaving = false
}) => {
    const [comment, setComment] = useState('');

    const handleConfirm = () => {
        onConfirm(comment);
    };

    const handleClose = () => {
        if (!isSaving) {
            setComment('');
            onClose();
        }
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose} disabled={isSaving}>
                        <Icon name="close-outline" size={30} color={isSaving ? "#555" : "#fff"} />
                    </TouchableOpacity>
                    
                    <Text style={styles.modalTitle}>Finalizar Tarefa</Text>
                    <Text style={styles.subtitle}>
                        Deseja adicionar uma observação final? (Opcional)
                    </Text>

                    <ScrollView>
                        <InputsField
                            label="Comentário / Observação"
                            placeholder="Ex: Deploy realizado com sucesso..."
                            value={comment}
                            onChangeText={setComment}
                            multiline={true}
                            numberOfLines={4}
                            maxLength={300}
                            editable={!isSaving}
                        />
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={isSaving ? "Finalizando..." : "Finalizar Tarefa"}
                        onPress={handleConfirm}
                        disabled={isSaving}
                        style={styles.finishButton}
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
        marginBottom: 10, 
        textAlign: 'center' 
    },
    subtitle: {
        fontSize: 14,
        color: '#A9A9A9',
        textAlign: 'center',
        marginBottom: 20,
    },
    closeButton: { 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        padding: 5, 
        zIndex: 1 
    },
    buttonContainer: { 
        marginTop: 20 
    },
    finishButton: {
        backgroundColor: '#3CB371', 
    }
});
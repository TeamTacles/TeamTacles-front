import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import { getErrorMessage } from '../../../utils/errorHandler';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onDeleteAccount: () => Promise<void>;
  showNotification: (options: { type: 'success' | 'error'; message: string }) => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onDeleteAccount,
  showNotification
}) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const validateForm = () => {
        if (confirmationText !== 'DELETAR') {
            setError('Digite "DELETAR" para confirmar.');
            return false;
        }
        setError(undefined);
        return true;
    };

    const handleInputChange = (value: string) => {
        setConfirmationText(value);
        if (error) {
            setError(undefined);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onDeleteAccount();

            showNotification({
                type: 'success',
                message: 'Conta deletada com sucesso.',
            });

            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            showNotification({
                type: 'error',
                message: getErrorMessage(error),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setConfirmationText('');
        setError(undefined);
        onClose();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Deletar Conta</Text>
                    <ScrollView>
                        <View style={styles.warningContainer}>
                            <Icon name="warning-outline" size={50} color="#FF3B30" />
                            <Text style={styles.warningText}>
                                Esta ação é irreversível!
                            </Text>
                            <Text style={styles.warningDescription}>
                                Todos os seus dados serão permanentemente deletados e você não poderá recuperá-los.
                            </Text>
                        </View>
                        <InputsField
                            label='Digite "DELETAR" para confirmar *'
                            placeholder='DELETAR'
                            value={confirmationText}
                            onChangeText={handleInputChange}
                            error={error}
                            editable={!loading}
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={loading ? "Deletando..." : "Deletar Conta"}
                        onPress={handleSubmit}
                        disabled={loading}
                        style={styles.deleteButton}
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
    warningContainer: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)'
    },
    warningText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginTop: 10,
        textAlign: 'center'
    },
    warningDescription: {
        fontSize: 14,
        color: '#CCCCCC',
        marginTop: 10,
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 20
    },
    deleteButton: {
        backgroundColor: '#FF3B30'
    }
});

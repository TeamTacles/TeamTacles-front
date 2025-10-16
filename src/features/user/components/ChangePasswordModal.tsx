import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { InputsField } from '../../../components/common/InputsField';
import Icon from 'react-native-vector-icons/Ionicons';
import { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { getErrorMessage } from '../../../utils/errorHandler';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onChangePassword: (password: string, passwordConfirm: string) => Promise<void>;
  notificationRef: React.RefObject<NotificationPopupRef | null>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onChangePassword,
  notificationRef
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!newPassword) {
            newErrors.newPassword = "A nova senha é obrigatória.";
        } else if (newPassword.length < 5 || newPassword.length > 100) {
            newErrors.newPassword = "A senha deve ter entre 5 e 100 caracteres.";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "A confirmação de senha é obrigatória.";
        } else if (newPassword && newPassword !== confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string, setter: (value: string) => void) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onChangePassword(newPassword, confirmPassword);

            notificationRef.current?.show({
                type: 'success',
                message: 'Senha alterada com sucesso!',
            });

            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            notificationRef.current?.show({
                type: 'error',
                message: getErrorMessage(error),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Trocar Senha</Text>
                    <ScrollView>
                        <InputsField
                            label="Nova Senha *"
                            placeholder='Digite sua nova senha'
                            value={newPassword}
                            onChangeText={(text) => handleInputChange('newPassword', text, setNewPassword)}
                            secureTextEntry={true}
                            error={errors.newPassword}
                            editable={!loading}
                        />
                        <InputsField
                            label="Confirmar Nova Senha *"
                            placeholder='Confirme sua nova senha'
                            value={confirmPassword}
                            onChangeText={(text) => handleInputChange('confirmPassword', text, setConfirmPassword)}
                            secureTextEntry={true}
                            error={errors.confirmPassword}
                            editable={!loading}
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={loading ? "Alterando..." : "Alterar Senha"}
                        onPress={handleSubmit}
                        disabled={loading}
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
        marginTop: 20
    }
});

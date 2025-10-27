import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FormCard } from '../../../components/common/FormCard';
import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { userService } from '../services/userService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { useAppContext } from '../../../contexts/AppContext';
import { useNotification } from '../../../contexts/NotificationContext';

export const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { signOut } = useAppContext();
    const { showNotification } = useNotification();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false); 

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await userService.getCurrentUser();
            setName(userData.username);
            setEmail(userData.email);
        } catch (error) {
            showNotification({
                type: 'error',
                message: 'Erro ao carregar seus dados.',
            });
        } finally {
            setLoadingData(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (name.length < 3) {
                throw new Error("O nome deve ter pelo menos 3 caracteres.");
            }

            setLoading(true);

            await userService.updateProfile({
                username: name,
            });

            showNotification({
                type: 'success',
                message: 'As suas informações foram atualizadas!',
            });

            setTimeout(() => {
                navigation.goBack();
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
    
    const handleChangePassword = () => {
        setChangePasswordModalVisible(true);
    };

    const handlePasswordChange = async (password: string, passwordConfirm: string) => {
        await userService.changePassword({ password, passwordConfirm });
    };

    const handleDeleteAccount = async () => {
        await userService.deleteAccount();
        signOut();
    };

    if (loadingData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EB5F1C" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back-outline" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <FormCard>
                    <InputsField
                        label="Nome"
                        placeholder="Digite seu nome completo"
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                    />
                    <InputsField
                        label="Email"
                        value={email}
                        editable={false}
                        style={styles.inputDisabled}
                        textContentType="emailAddress"
                    />
                    <View style={styles.button}>
                        <MainButton 
                            title={loading ? "Salvando..." : "Salvar Alterações"} 
                            onPress={handleSaveChanges}
                            disabled={loading}
                        />
                    </View>
                </FormCard>
                <View style={styles.passwordSection}>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    <View style={styles.passwordButton}>
                        <MainButton title="Trocar Senha" onPress={handleChangePassword} />
                    </View>
                    <View style={styles.deleteButton}>
                        <MainButton
                            title="Deletar Conta"
                            onPress={() => setDeleteAccountModalVisible(true)}
                            style={styles.deleteButtonStyle}
                        />
                    </View>
                </View>
            </ScrollView>
            <ChangePasswordModal
                visible={changePasswordModalVisible}
                onClose={() => setChangePasswordModalVisible(false)}
                onChangePassword={handlePasswordChange}
                showNotification={showNotification}
            />
            <DeleteAccountModal
                visible={deleteAccountModalVisible}
                onClose={() => setDeleteAccountModalVisible(false)}
                onDeleteAccount={handleDeleteAccount}
                showNotification={showNotification}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#191919',
    },
    loadingContainer: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: 30,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    scrollContainer: {
        padding: 20,
    },
    inputDisabled: {
        color: '#A9A9A9',
    },
    passwordSection: {
        margin: 'auto',
        paddingTop: 20,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 10,
        width: '90%',
        justifyContent: 'center',
    },
    passwordButton: {
        marginBottom: 10,
    },
    deleteButton: {

    },
    deleteButtonStyle: {
        backgroundColor: '#FF3B30',
    },
    sectionTitle: {
        color: '#ffffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    button: {
        paddingTop: 20,
        paddingBottom: 20,
    }
});
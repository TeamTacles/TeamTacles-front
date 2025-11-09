import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { MainButton } from "../../../components/common/MainButton";
import { InputsField } from "../../../components/common/InputsField";
import { FormCard } from "../../../components/common/FormCard";
import Hyperlink from '../../../components/common/Hyperlink';
import { RootStackParamList } from "../../../types/Navigation";
import { register } from '../services/authService';
import { InfoPopup } from "../../../components/common/InfoPopup";
import { ErrorCode } from '../../../types/api'; 

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [successPopupVisible, setSuccessPopupVisible] = useState(false);
    const [errorPopupVisible, setErrorPopupVisible] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedUsername) newErrors.username = "O nome de usuário é obrigatório.";
        else if (trimmedUsername.length > 50) newErrors.username = "Usuário não pode ter mais de 50 caracteres.";
        if (!trimmedEmail) newErrors.email = "O email é obrigatório.";
        else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = "O formato do email é inválido.";
        else if (trimmedEmail.length > 100) newErrors.email = "O email não pode exceder 100 caracteres.";
        if (!trimmedPassword) newErrors.password = "A senha é obrigatória.";
        else if (trimmedPassword.length < 5 || trimmedPassword.length > 100) newErrors.password = "A senha deve ter entre 5 e 100 caracteres.";
        if (!trimmedConfirmPassword) newErrors.confirmPassword = "A confirmação de senha é obrigatória.";
        else if (trimmedPassword && trimmedPassword !== trimmedConfirmPassword) newErrors.confirmPassword = "As senhas não coincidem.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Remove espaços em branco no início e fim dos campos
            const trimmedData = {
                username: username.trim(),
                email: email.trim(),
                password: password.trim(),
                passwordConfirm: confirmPassword.trim()
            };

            await register(trimmedData);
            setSuccessPopupVisible(true);
        } catch (error) {
            console.error('❌ Erro ao registrar:', error);
            
            if (isAxiosError(error) && error.response) {
                const errorCode = error.response.data?.errorCode;
                
                if (errorCode === ErrorCode.USERNAME_ALREADY_EXISTS) {
                    setErrors({ username: "Este nome de usuário já está em uso." });
                } else if (errorCode === ErrorCode.EMAIL_ALREADY_EXISTS) {
                    setErrors({ email: "Este email já está cadastrado." });
                } else if (errorCode === ErrorCode.PASSWORD_MISMATCH) {
                    setErrors({ confirmPassword: "As senhas não coincidem." });
                } else {
                    setErrorPopupVisible(true);
                }
            } else {
                setErrorPopupVisible(true);
            }
        } finally {
            setLoading(false);
        }
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

    const handleSuccessPopupClose = () => {
        setSuccessPopupVisible(false);
        navigation.navigate('Login');
    };

    const goToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <FormCard>
                <Image source={require('../../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.introductionText}>Organize seus projetos com a inteligência de um polvo.</Text>
                <InputsField label="Usuário" value={username} onChangeText={(text) => handleInputChange('username', text, setUsername)} error={errors.username} />
                <InputsField label="Email" value={email} onChangeText={(text) => handleInputChange('email', text, setEmail)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
                <InputsField label="Senha" value={password} onChangeText={(text) => handleInputChange('password', text, setPassword)} secureTextEntry={true} error={errors.password} />
                <InputsField label="Confirmar Senha" value={confirmPassword} onChangeText={(text) => handleInputChange('confirmPassword', text, setConfirmPassword)} secureTextEntry={true} error={errors.confirmPassword} />
                <View style={{ paddingTop: 20 }}>
                    <MainButton title={loading ? "Registrando..." : "Entrar no Mar"} onPress={handleRegister} disabled={loading} />
                </View>
                <Hyperlink label="Já sou cadastrado" onPress={goToLogin} />
            </FormCard>

            <InfoPopup
                visible={successPopupVisible}
                imageSource={require('../../../assets/email_sent_icon.png')}
                title="Cadastro Realizado!"
                message="Enviamos um e-mail de verificação para sua caixa de entrada. Por favor, confirme para ativar sua conta."
                onClose={handleSuccessPopupClose}
            />

            <InfoPopup
                visible={errorPopupVisible}
                imageSource={require('../../../assets/error_500.png')} 
                title="Erro Inesperado"
                message="Não foi possível processar sua solicitação. Por favor, verifique sua conexão ou tente novamente mais tarde."
                onClose={() => setErrorPopupVisible(false)} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#232323' },
        logo: { width: 200, height: 160, marginBottom: 10, alignSelf: 'center' },
        introductionText: { color: '#ffffff', fontSize: 18, marginBottom: 20, textAlign: 'center' },
});
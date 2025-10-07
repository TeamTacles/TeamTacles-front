import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { Hyperlink } from "../components/Hyperlink";
import { InfoPopup } from "../components/InfoPopup";
import { RootStackParamList } from "../types/Navigation";
import { userService } from '../services/userService';

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

    // Função de validação do formulário (FRONT-END)
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!username) newErrors.username = "O nome de usuário é obrigatório.";
        else if (username.length > 50) newErrors.username = "Usuário não pode ter mais de 50 caracteres.";
        if (!email) newErrors.email = "O email é obrigatório.";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "O formato do email é inválido.";
        else if (email.length > 100) newErrors.email = "O email não pode exceder 100 caracteres.";
        if (!password) newErrors.password = "A senha é obrigatória.";
        else if (password.length < 5 || password.length > 100) newErrors.password = "A senha deve ter entre 5 e 100 caracteres.";
        if (!confirmPassword) newErrors.confirmPassword = "A confirmação de senha é obrigatória.";
        else if (password && password !== confirmPassword) newErrors.confirmPassword = "As senhas não coincidem.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Função de validação e submissão do formulário (BACK-END)
    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await userService.registerUser({ username, email, password, passwordConfirm: confirmPassword });
            setSuccessPopupVisible(true);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 409 && data?.errorCode) {
                    const newErrors: { [key: string]: string } = {};
                    if (data.errorCode === 'USERNAME_ALREADY_EXISTS') newErrors.username = "Este nome de usuário já está em uso.";
                    else if (data.errorCode === 'EMAIL_ALREADY_EXISTS') newErrors.email = "Este email já está cadastrado.";
                    setErrors(newErrors);
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

    // Função para atualizar os campos e limpar erros específicos
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
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                <Text style={styles.introductionText}>Pronto para explorar as profundezas com organização?</Text>
                <InputsField label="Usuário" value={username} onChangeText={(text) => handleInputChange('username', text, setUsername)} error={errors.username} />
                <InputsField label="Email" value={email} onChangeText={(text) => handleInputChange('email', text, setEmail)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
                <InputsField label="Senha" value={password} onChangeText={(text) => handleInputChange('password', text, setPassword)} secureTextEntry={true} error={errors.password} />
                <InputsField label="Confirmar Senha" value={confirmPassword} onChangeText={(text) => handleInputChange('confirmPassword', text, setConfirmPassword)} secureTextEntry={true} error={errors.confirmPassword} />
                <View style={{ paddingTop: 20 }}>
                    <MainButton title={loading ? "Registrando..." : "Entrar no Mar"} onPress={handleRegister} disabled={loading} />
                </View>
                <Hyperlink label="Já sou cadastrado" onPress={goToLogin} />
            </FormCard>

            {/* Popup de Sucesso */}
            <InfoPopup
                visible={successPopupVisible}
                imageSource={require('../assets/email_sent_icon.png')}
                title="Cadastro Realizado!"
                message="Enviamos um e-mail de verificação para sua caixa de entrada. Por favor, confirme para ativar sua conta."
                onClose={handleSuccessPopupClose}
            />

            {/* POPUP ERROS GENÉRICOS */}
            <InfoPopup
                visible={errorPopupVisible}
                imageSource={require('../assets/error_500.png')} 
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
        logo: { width: 130, height: 100, marginBottom: 10, alignSelf: 'center' },
        introductionText: { color: '#ffffff', fontSize: 18, marginBottom: 20, textAlign: 'center' },
});
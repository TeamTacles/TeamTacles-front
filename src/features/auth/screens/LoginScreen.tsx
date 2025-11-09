import React, { useState } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { useAppContext } from "../../../contexts/AppContext";
import { LoginData } from "../../../types/auth";
import { getErrorMessage } from "../../../utils/errorHandler";
import { ErrorCode } from "../../../types/api";
import { resendVerification } from "../services/authService";

import { MainButton } from "../../../components/common/MainButton";
import { InputsField } from "../../../components/common/InputsField";
import { FormCard } from "../../../components/common/FormCard";
import Hyperlink from '../../../components/common/Hyperlink';
import { RootStackParamList } from "../../../types/Navigation";
import { VerificationPopup } from "../components/VerificationPopup";
import { InfoPopup } from "../../../components/common/InfoPopup";

const logo = require('../../../assets/logo.png');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();

    const { signIn } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showResendSuccessPopup, setShowResendSuccessPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setErrorMessage('Por favor, preencha todos os campos.');
            setShowErrorPopup(true);
            return;
        }

        setIsLoading(true);
        try {
            const credentials: LoginData = { email: trimmedEmail, password: trimmedPassword };
            await signIn(credentials);

        } catch (error) {
            console.log('💬 Erro capturado no login:', error);

            // Verifica se é erro de conta não verificada
            if (isAxiosError(error) && error.response?.data?.errorCode === ErrorCode.ACCOUNT_NOT_VERIFIED) {
                setShowVerificationPopup(true);
            } else {
                const message = isAxiosError(error)
                    ? getErrorMessage(error)
                    : 'Erro ao tentar fazer login. Tente novamente.';

                setErrorMessage(message);
                setShowErrorPopup(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            await resendVerification(email.trim());
            setShowVerificationPopup(false);
            setShowResendSuccessPopup(true);
        } catch (error) {
            console.error('Erro ao reenviar verificação:', error);
            setShowVerificationPopup(false);
            setErrorMessage('Erro ao reenviar e-mail de verificação. Tente novamente.');
            setShowErrorPopup(true);
        } finally {
            setIsResending(false);
        }
    };

    const goToRegister = () => {
        navigation.navigate('Register');
    };


    return (
        <View style={ style.LoginScreen }>
            <VerificationPopup
                visible={showVerificationPopup}
                email={email}
                onResend={handleResendVerification}
                onClose={() => setShowVerificationPopup(false)}
                isResending={isResending}
                imageSource={require('../../../assets/polvo_nao_verificado.png')}
            />

            <InfoPopup
                visible={showResendSuccessPopup}
                title="E-mail Enviado"
                message="E-mail de verificação reenviado! Verifique sua caixa de entrada."
                onClose={() => setShowResendSuccessPopup(false)}
                imageSource={require('../../../assets/polvo_verificar.png')}
            />

            <InfoPopup
                visible={showErrorPopup}
                title="Falha no Login"
                message={errorMessage}
                onClose={() => setShowErrorPopup(false)}
            />

            <FormCard>
                <Image source={ logo } style={ style.logo } />
                <Text style={ style.introductionText }>
                    Organize seus projetos com a inteligência de um polvo.
                </Text>
                <InputsField
                    label="Email" 
                    placeholder="Digite seu email"
                    value={email}
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <InputsField
                    label="Senha"
                    placeholder="Digite a sua senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                <Hyperlink
                    label="Esqueci minha senha"
                    onPress={() => navigation.navigate('ForgotPassword')} />
                <View style={{paddingTop: 30}}>
                    <MainButton 
                        title={isLoading ? "Mergulhando..." : "Mergulhar"} 
                        onPress={handleLogin} 
                        disabled={isLoading}
                    />
                </View>
                <Hyperlink
                    label="Realizar cadastro"
                    onPress={goToRegister} />
            </FormCard>
        </View>
    );
}

const style = StyleSheet.create({
    LoginScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#232323',
    },
    logo: {
        width: 200,
        height: 160,
        marginBottom: 20,
        alignSelf: 'center'
    },
    introductionText: {
        color: '#ffffff',
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
});
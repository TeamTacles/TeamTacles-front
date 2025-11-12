import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import Hyperlink from '../../../components/common/Hyperlink';
import { FormCard } from '../../../components/common/FormCard';
import { forgotPassword } from '../services/authService';
import { RootStackParamList } from '../../../types/Navigation';
import { InfoPopup } from '../../../components/common/InfoPopup';

const logo = require('../../../assets/logo.png');
const emailSentIcon = require('../../../assets/email_sent_icon.png');

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');

    // Validação de email com regex
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleForgotPassword = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setPopupTitle('Campo Obrigatório');
            setPopupMessage('Por favor, insira seu e-mail para continuar.');
            setPopupVisible(true);
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            setPopupTitle('Email Inválido');
            setPopupMessage('Por favor, insira um endereço de e-mail válido (ex: usuario@exemplo.com).');
            setPopupVisible(true);
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(trimmedEmail);
            setPopupTitle('Verifique seu E-mail');
            setPopupMessage('Caso seu e-mail esteja cadastrado em nosso sistema, você receberá um link para redefinição de senha.');
            setPopupVisible(true);
        } catch (error: any) {
            setPopupTitle('Verifique seu E-mail');
            setPopupMessage('Caso seu e-mail esteja cadastrado em nosso sistema, você receberá um link para redefinição de senha.');
            setPopupVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <InfoPopup
                visible={popupVisible}
                title={popupTitle}
                message={popupMessage}
                onClose={handleClosePopup}
                imageSource={emailSentIcon}
            />
            <FormCard>
                <Image source={logo} style={styles.logo} />
                <Text style={styles.introductionText}>
                    Esqueceu sua senha? Sem problemas.
                </Text>
                <Text style={styles.subtitle}>
                    Insira seu e-mail para enviarmos um link de recuperação.
                </Text>

                <InputsField
                    label="Email"
                    placeholder="Digite seu email de cadastro"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <View style={{ paddingTop: 30, paddingBottom: 15 }}>
                    <MainButton
                        title={loading ? "Enviando..." : "Enviar E-mail"}
                        onPress={handleForgotPassword}
                        disabled={loading}
                    />
                </View>

                <Hyperlink
                    label="Voltar para o Login"
                    onPress={() => navigation.goBack()}
                />
            </FormCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#232323',
    },
    logo: {
        width: 130,
        height: 100,
        marginBottom: 20,
        alignSelf: 'center'
    },
    introductionText: {
        color: '#ffffff',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 30,
        textAlign: 'center',
    }
});
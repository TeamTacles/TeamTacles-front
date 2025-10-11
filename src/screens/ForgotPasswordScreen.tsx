import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { InputsField } from '../components/InputsField';
import { MainButton } from '../components/MainButton';
import Hyperlink from '../components/Hyperlink';
import { FormCard } from '../components/FormCard';
import { forgotPassword } from '../services/authService';
import { RootStackParamList } from '../types/Navigation';
import { InfoPopup } from '../components/InfoPopup'; 

const logo = require('../assets/logo.png');
const emailSentIcon = require('../assets/email_sent_icon.png'); 

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');

    const handleForgotPassword = async () => {
        if (!email) {
            setPopupTitle('Campo Obrigatório');
            setPopupMessage('Por favor, insira seu e-mail para continuar.');
            setPopupVisible(true);
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            // 4. Configurar e exibir o popup de sucesso
            setPopupTitle('Verifique seu E-mail');
            setPopupMessage('Caso seu e-mail esteja em nosso sistema, um link para redefinição de senha foi enviado.');
            setPopupVisible(true);
        } catch (error: any) {
            // Mesmo em caso de erro, exibimos a mesma mensagem de sucesso por segurança
            setPopupTitle('Verifique seu E-mail');
            setPopupMessage('Caso seu e-mail esteja em nosso sistema, um link para redefinição de senha foi enviado.');
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
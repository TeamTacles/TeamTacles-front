import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Alert, Platform } from "react-native"; 
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { useAppContext } from "../contexts/AppContext";
import { LoginData } from "../types/AuthTypes";
import { getErrorMessage } from "../utils/errorHandler";

import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import Hyperlink from '../components/Hyperlink';
import { RootStackParamList } from "../types/Navigation";

const logo = require('../assets/logo.png');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    
    const { signIn } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            if (Platform.OS === 'web') {
                window.alert('Por favor, preencha todos os campos.');
            } else {
                Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            }
            return;
        }

        setIsLoading(true);
        try {
            const credentials: LoginData = { email: trimmedEmail, password: trimmedPassword };
            await signIn(credentials);

        } catch (error) {
            const errorMessage = isAxiosError(error)
                ? getErrorMessage(error)
                : 'Erro ao tentar fazer login. Tente novamente.';

            console.log('💬 Mensagem que será exibida:', errorMessage);
            
            if (Platform.OS === 'web') {
                window.alert('Falha no Login\n\n' + errorMessage);
            } else {
                Alert.alert('Falha no Login', errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const goToRegister = () => {
        navigation.navigate('Register');
    };

  
    return (
        <View style={ style.LoginScreen }>
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
        width: 130,
        height: 100,
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
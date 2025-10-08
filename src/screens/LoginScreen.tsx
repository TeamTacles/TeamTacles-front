// Arquivo: src/screens/LoginScreen.tsx

import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// NOSSAS ADIÇÕES
import { useAppContext } from "../contexts/AppContext"; 
import { LoginData } from "../types/AuthTypes";

// SEUS COMPONENTES
import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import Hyperlink from '../components/Hyperlink'; 
import { RootStackParamList } from "../types/Navigation";

const logo = require('../assets/logo.png');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    
    // NOSSAS ADIÇÕES
    const { signIn } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    // MUDANÇA CRÍTICA: de 'username' para 'email' para bater com a API
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => { // <-- MUDANÇA: Função agora é async
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);
        try {
            const credentials: LoginData = { email, password };
            await signIn(credentials);
            // Se o login for bem-sucedido, o RootNavigator já cuida do redirecionamento.
            // A linha abaixo não é mais necessária:
            // goToMainPage();
        } catch (error) {
            Alert.alert('Falha no Login', 'Credenciais inválidas. Verifique seus dados e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const goToRegister = () => {
        navigation.navigate('Register');
    };

    // Esta função não é mais necessária, o RootNavigator faz o trabalho
    // const goToMainPage = () => {
    //     navigation.navigate('Menu');
    // };

    return (
        <View style={ style.LoginScreen }>
            <FormCard>
                <Image source={ logo } style={ style.logo } />
                <Text style={ style.introductionText }>
                    Organize seus projetos com a inteligência de um polvo.
                </Text>
                <InputsField
                    label="Email" // <-- MUDANÇA: Label ajustada para clareza
                    placeholder="Digite seu email"
                    value={email}
                    onChangeText={setEmail} // <-- MUDANÇA: de setUsername para setEmail
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
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                    <Hyperlink
                        label="Esqueci minha senha"
                        onPress={() => Alert.alert('Recuperação de senha', 'Funcionalidade em desenvolvimento.')} /> 
                </View>
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
import React, { useState } from "react";

import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { Hyperlink } from "../components/Hyperlink";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { useNavigation } from '@react-navigation/native';

const logo = require('../assets/logo.png');

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogin = () => {
        if (!username || !password || !email || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        else if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        Alert.alert('Sucesso!', 'Registro realizado com sucesso!');
        navigation.navigate('Login');
    };

    const goToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={ style.RegisterScreen }>
            <FormCard>
                <Image source={ logo } style={ style.logo } />
                <Text style={ style.introductionText }>
                    Pronto para explorar as profundezas com organização?
                </Text>
                <InputsField
                    label="Usuário"
                    placeholder="👨‍🦲 Nome de Usuário"
                    value={username}
                    onChangeText={setUsername}
                />

                <InputsField
                    label="Email"
                    placeholder="@ Digite seu email"
                    value={email}
                    onChangeText={setEmail}
                />

                <InputsField
                    label="Senha"
                    placeholder="🔒 Digite a sua senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <InputsField
                    label="Confirmar Senha"
                    placeholder="🔒 Confirme sua senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                />

                <MainButton title="Entrar no Mar" onPress={handleLogin} />

                <Hyperlink
                    label="Já sou cadastrado"
                    onPress={goToLogin} />
            </FormCard>
        </View>
    );
}

const style = StyleSheet.create({
    RegisterScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#2A2A2A',
    },
    logo: {
        width: 130,
        height: 100,
        marginBottom: 10,
        alignSelf: 'center'
    },
    introductionText: {
        color: '#ffffff',
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },

});
import React, { useState } from "react";

import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { Hyperlink } from "../components/Hyperlink";
import { View, StyleSheet, Image, Text, Alert } from "react-native";

const logo = require('../assets/logo.png');


export const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (!username || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        Alert.alert('Sucesso!', `Login com usuário: ${username}`);
    };

    return (
        <View style={ style.LoginScreen }>
            <FormCard>
                <Image source={ logo } style={ style.logo } />
                <Text style={ style.introductionText }>
                    Organize seus projetos com a inteligência de um polvo.
                </Text>
                <InputsField
                    label="Usuário ou Email"
                    placeholder="👨‍🦲 Digite seu usuário ou email"
                    value=""
                    onChangeText={setUsername}
                />
                <InputsField
                    label="Senha"
                    placeholder="🔒 Digite a sua senha"
                    value=""
                    onChangeText={setPassword}
                />
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                    <Hyperlink
                        label="Esqueci minha senha"
                        onPress={() => Alert.alert('Recuperação de senha', 'Funcionalidade em desenvolvimento.')} /> {/* redirecionar p tela de recuperação */}
                </View>
                <MainButton title="Mergulhar" onPress={handleLogin} />

                <Hyperlink
                    label="Realizar cadastro"
                    onPress={() => Alert.alert('Cadastro', 'Funcionalidade em desenvolvimento.')} /> {/* redirecionar p tela de cadastro */}
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
import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { Hyperlink } from "../components/Hyperlink";
import { InfoPopup } from "../components/InfoPopup"; 
import { RootStackParamList } from "../types/Navigation";
import { userService } from '../services/userService'; 
const logo = require('../assets/logo.png');

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false); 

    const handleRegister = async () => {
        if (!username || !password || !email || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setLoading(true); 

        try {
    const payload = { 
        username, email, password, passwordConfirm: confirmPassword 
    };  
    const response = await userService.registerUser(payload);
            
            setPopupVisible(true);

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Não foi possível realizar o cadastro.";
            Alert.alert("Erro no Cadastro", errorMessage);
        } finally {
            setLoading(false); 
        }
    };

    const handlePopupClose = () => {
        setPopupVisible(false);
        navigation.navigate('Login');
    };

    const goToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={ styles.container }>
            <FormCard>
                <Image source={ logo } style={ styles.logo } />
                <Text style={ styles.introductionText }>
                    Pronto para explorar as profundezas com organização?
                </Text>
                <InputsField
                    label="Usuário"
                    placeholder="Guia Nome de Usuário"
                    value={username}
                    onChangeText={setUsername}
                />
                <InputsField
                    label="Email"
                    placeholder="Digite seu email"
                    value={email}
                    onChangeText={setEmail}
                />
                <InputsField
                    label="Senha"
                    placeholder="Digite a sua senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                <InputsField
                    label="Confirmar Senha"
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                />
                <View style={{paddingTop: 20}}>
                    <MainButton 
                        title={loading ? "Registrando..." : "Entrar no Mar"} 
                        onPress={handleRegister} 
                        disabled={loading} 
                    />
                </View>
                <Hyperlink
                    label="Já sou cadastrado"
                    onPress={goToLogin} 
                />
            </FormCard>

            <InfoPopup
                visible={popupVisible}
                title="✅ Cadastro Realizado!"
                message="Enviamos um e-mail de verificação para sua caixa de entrada. Por favor, confirme para ativar sua conta."
                onClose={handlePopupClose}
            />
        </View>
    );
}

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
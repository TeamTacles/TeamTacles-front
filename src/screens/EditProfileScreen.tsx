// src/screens/EditProfileScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Header } from "../components/Header";

import { FormCard } from '../components/FormCard';
import { InputsField } from '../components/InputsField';
import { MainButton } from '../components/MainButton';

export const EditProfileScreen = () => {
    const navigation = useNavigation();

    const [name, setName] = useState('Caio Dib');
    const [email, setEmail] = useState('caio.dib@example.com');

    const handleSaveChanges = () => {
        Alert.alert("Sucesso", "As suas informações foram atualizadas.");
        navigation.goBack();
    };
    
    const handleChangePassword = () => {
        Alert.alert("Trocar Senha", "Funcionalidade em desenvolvimento.");
    };

    const userWithAvatar = {
            avatarUrl: '../assets/profileIcon.png',
            initials: 'CD', 
        };
    
        const userWithInitials = {
            initials: 'CD', 
        };
    
        const handleProfilePress = () => {
            Alert.alert("Perfil Clicado!");
        };
    
        const handleNotificationsPress = () => {
            Alert.alert("Notificações Clicadas!");
        };
    

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Customizado com Botão de Voltar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back-outline" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <FormCard>
                    <InputsField
                        label="Nome"
                        placeholder="Digite seu nome completo"
                        value={name}
                        onChangeText={setName}
                    />
                    <InputsField
                        label="Email"
                        value={email}
                        editable={false} // Emails geralmente não são editáveis diretamente
                        style={styles.inputDisabled}
                    />
                    <View style={styles.button}>
                        <MainButton title="Salvar Alterações" onPress={handleSaveChanges} />
                    </View>
                </FormCard>
                <View style={styles.passwordSection}>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    <View style={styles.passwordButton}>
                        <MainButton title="Trocar Senha" onPress={handleChangePassword} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#191919',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: 30,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    scrollContainer: {
        padding: 20,
    },
    inputDisabled: {
        color: '#A9A9A9', // Cor para indicar que o campo está desabilitado
    },
    passwordSection: {
        margin: 'auto',
        paddingTop: 20,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 10,
        width: '90%',
        justifyContent: 'center',
    },
    passwordButton: {

    },
    sectionTitle: {
        color: '#ffffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    button: {
        paddingTop: 20,
        paddingBottom: 20,
    }
});
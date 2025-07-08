import React, { useState } from "react";
import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Text, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { Header } from "../components/Header";
import Icon from 'react-native-vector-icons/Ionicons';
import { getInitialsFromArray } from "../utils/stringUtils";
import { useAppContext } from "../contexts/AppContext";

type ProjectFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProjectForm'>;

export const ProjectForm = () => {
    const navigation = useNavigation<ProjectFormNavigationProp>();
    const { addProject } = useAppContext(); 

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [teamMember, setTeamMember] = useState('');

    const handleCreateProject = () => {
        if (!projectName || !teamMember) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        addProject({
            title: projectName,
            description: projectDescription,
            teamMembers: getInitialsFromArray(teamMember)
        });
        
        navigation.goBack();
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

    const closeForm = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.ProjectFormScreen}>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <FormCard>
                <Icon
                    name="close-outline" size={40} color="#fff"
                    style={{ marginBottom: 20, alignSelf: 'flex-end' }}
                    onPress={closeForm} />
                <Text style={styles.title}>Criar um Projeto</Text>
                <InputsField
                    label="Título: *"
                    placeholder="Escreva um título para o projeto"
                    value={projectName}
                    onChangeText={setProjectName}
                />
                <InputsField
                    label="Descrição:"
                    placeholder="Escreva uma breve descrição"
                    value={projectDescription}
                    onChangeText={setProjectDescription}
                    maxLength={50}
                />
                <InputsField
                    label="Time: *"
                    placeholder="Digite os nomes, separados por vírgula"
                    value={teamMember}
                    onChangeText={setTeamMember}
                />
                <MainButton title="Despertar o polvo" onPress={handleCreateProject} />
            </FormCard>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    ProjectFormScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#191919',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#BC6135',
    },
});
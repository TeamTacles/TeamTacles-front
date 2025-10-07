import React, { useState } from "react";
import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Text } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { Header } from "../components/Header";
import Icon from 'react-native-vector-icons/Ionicons';
import { getInitialsFromName } from "../utils/stringUtils";
import { useAppContext } from "../contexts/AppContext";
import { InfoPopup } from "../components/InfoPopup";

type ProjectFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProjectForm'>;

export const ProjectForm = () => {
    const navigation = useNavigation<ProjectFormNavigationProp>();
    const { addProject } = useAppContext();

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [teamMember, setTeamMember] = useState('');
    const [infoPopup, setInfoPopup] = useState({ visible: false, message: '' });

    const handleCreateProject = () => {
        if (!projectName || !teamMember) {
            setInfoPopup({ visible: true, message: 'Por favor, preencha todos os campos obrigatórios.' });
            return;
        }

        const members = teamMember.split(',').map(name => name.trim()).filter(name => name).map(name => ({
            name: name,
            initials: getInitialsFromName(name)
        }));

        addProject({
            title: projectName,
            description: projectDescription,
            teamMembers: members
        });
        
        navigation.goBack();
    };

    const userWithAvatar = { initials: 'CD' };
    const handleProfilePress = () => {};
    const handleNotificationsPress = () => {};
    const closeForm = () => navigation.goBack();

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
                    maxLength={250}
                    multiline
                    numberOfLines={4}
                />
                <InputsField
                    label="Time: *"
                    placeholder="Digite os nomes, separados por vírgula"
                    value={teamMember}
                    onChangeText={setTeamMember}
                />
                <MainButton title="Despertar o Polvo" onPress={handleCreateProject} />
            </FormCard>

            <InfoPopup
                visible={infoPopup.visible}
                title="⚠️ Atenção"
                message={infoPopup.message}
                onClose={() => setInfoPopup({ visible: false, message: '' })}
            />
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
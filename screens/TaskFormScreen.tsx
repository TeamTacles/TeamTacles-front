import React, { useState } from "react";

import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Pressable, Text, Alert, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { Header } from "../components/Header";
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type TaskFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskForm'>;

export const TaskForm = () => {
    const navigation = useNavigation<TaskFormNavigationProp>();

    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [teamMember, setTeamMember] = useState('');

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [showPicker, setShowPicker] = useState(false);

    const handleCreateTask = () => {
        if (!taskName || !teamMember) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        Alert.alert('Sucesso!', `Tarefa criada: ${taskName}`);
        navigation.goBack();
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(false); 
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
    };

    const formatDate = (date?: Date): string => {
        if (!date) return '';
        return date.toLocaleDateString();
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
        <SafeAreaView style={styles.taskFormScreen}>
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
                <Text style={styles.title}>Criar nova Tarefa</Text>
                <InputsField
                    label="Título: *"
                    placeholder="Escreva um título para a Tarefa"
                    value={taskName}
                    onChangeText={setTaskName}
                />
                <InputsField
                    label="Descrição:"
                    placeholder="Escreva uma breve descrição"
                    value={taskDescription}
                    onChangeText={setTaskDescription}
                    maxLength={255}
                /> 

                <Pressable onPress={() => setShowPicker(true)}>
                    <InputsField
                        label="Prazo: *"
                        placeholder="Selecione uma data"
                        value={formatDate(date)}
                        editable={false} // Impede digitação manual
                    />
                </Pressable>

                {showPicker && (
                    <DateTimePicker
                        value={date || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                    />
                )}

                <InputsField
                    label="Atribuir Responsabilidades: *"
                    placeholder="Digite o nome de usuário ou email"
                    value={teamMember}
                    onChangeText={setTeamMember}
                />
                <MainButton title="Soltar um Tentáculo" onPress={handleCreateTask} />
            </FormCard>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    taskFormScreen: {
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
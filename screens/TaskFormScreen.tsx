import React, { useState } from "react";

import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Pressable, Text, Alert, Platform, Button } from "react-native";
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
    const [dueDate, setDueDate] = useState('');

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleCreateTask = () => {
        if (!taskName || !teamMember) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        Alert.alert('Sucesso!', `Tarefa criada: ${taskName}`);
        navigation.goBack();
    };

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;

        if (event.type === 'set') {
            setDate(currentDate);
            setDueDate(formatDate(currentDate));
        }

        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
    };

    // Função para confirmar a data no iOS
    const confirmIOSDate = () => {
        setDueDate(date.toLocaleDateString('pt-BR'));
        setShowPicker(false);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
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
                    multiline={true}
                    numberOfLines={5}
                /> 

                <Pressable onPress={toggleDatePicker}>
                    <View pointerEvents="none"> 
                        <InputsField
                            label="Prazo: *"
                            placeholder="Selecione uma data"
                            value={dueDate}
                            editable={false}
                        />
                    </View>
                </Pressable>

                {showPicker && (
                    <DateTimePicker
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        value={date}
                        onChange={onDateChange}
                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                        minimumDate={new Date()}
                    />
                )}

                {showPicker && Platform.OS === 'ios' && (
                    <View style={styles.iosButtonContainer}>
                        <Button title="Confirmar" onPress={confirmIOSDate} />
                        <Button title="Cancelar" onPress={toggleDatePicker} />
                    </View>
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
    iosButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    }
});
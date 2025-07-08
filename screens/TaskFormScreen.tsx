import React, { useState } from "react";
import { MainButton } from "../components/MainButton";
import { InputsField } from "../components/InputsField";
import { FormCard } from "../components/FormCard";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Pressable, Text, Alert, Platform, Button, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { Header } from "../components/Header";
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAppContext } from "../contexts/AppContext"; 

type TaskFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskForm'>;

export const TaskForm = () => {
    const navigation = useNavigation<TaskFormNavigationProp>();
    const { projects, addTask } = useAppContext(); 

    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleCreateTask = () => {
        if (!taskName || !selectedProjectId || !dueDate) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios: Título, Projeto e Prazo.');
            return;
        }

        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (!selectedProject) return;

        addTask({
            title: taskName,
            description: taskDescription,
            dueDate: dueDate,
            projectId: selectedProject.id,
            projectName: selectedProject.title,
        });

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
            <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', width: '100%'}}>
            <FormCard>
                <Icon
                    name="close-outline" size={40} color="#fff"
                    style={{ marginBottom: 20, alignSelf: 'flex-end' }}
                    onPress={closeForm} />
                <Text style={styles.title}>Criar nova Tarefa</Text>
                <Text style={styles.label}>Projeto: *</Text>
                <View style={styles.projectSelector}>
                    {projects.map(project => (
                        <TouchableOpacity
                            key={project.id}
                            style={[
                                styles.projectButton,
                                selectedProjectId === project.id && styles.selectedProjectButton
                            ]}
                            onPress={() => setSelectedProjectId(project.id)}
                        >
                            <Text style={styles.projectButtonText}>{project.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
                    numberOfLines={4}
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
                    />
                )}
                 {showPicker && Platform.OS === 'ios' && (
                    <View style={styles.iosButtonContainer}>
                        <Button title="Confirmar" onPress={confirmIOSDate} />
                        <Button title="Cancelar" onPress={toggleDatePicker} />
                    </View>
                )}
                <MainButton title="Soltar um Tentáculo" onPress={handleCreateTask} />
            </FormCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    taskFormScreen: {
        flex: 1,
        backgroundColor: '#191919',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#BC6135',
    },
    label: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 10,
        marginTop: 15,
        alignSelf: 'flex-start',
    },
    projectSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    projectButton: {
        backgroundColor: '#555',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedProjectButton: {
        backgroundColor: '#EB5F1C',
    },
    projectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    iosButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    }
});
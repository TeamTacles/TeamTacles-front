import React, { useState } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, Text, Alert, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, RootTabParamList } from "../types/Navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '../components/EmptyState';

const polvo_tasks = require('../assets/polvo_tasks.png');

type TaskScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Tarefas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TaskScreen = ({ navigation }: TaskScreenNavigationProp) => {
    const [tasks, setTasks] = useState<any[]>([]);

    const userWithAvatar = {
        initials: 'CD',
    };

    const handleProfilePress = () => {
        Alert.alert("Perfil Clicado!");
    };

    const handleNotificationsPress = () => {
        Alert.alert("Notificações Clicadas!");
    };

    const handleNewTask = () => {
        navigation.navigate('TaskForm');
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <SearchBar
                title="Suas tarefas"
                placeholder="Pesquisar Tarefas"
            />
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View><Text style={{ color: 'white' }}>{item.title}</Text></View>
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <EmptyState
                        imageSource={polvo_tasks}
                        title="Nenhuma tarefa por aqui!"
                        subtitle="Crie tarefas dentro de um projeto."
                    />
                }
            />
            <View style={styles.addButtonContainer}>
                <NewItemButton
                    onPress={handleNewTask}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: '#191919'
    },
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 15,
    },
    addButtonContainer: {
        position: 'absolute',
        right: 25,
        bottom: 25,
    },
});
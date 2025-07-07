import React, { useState } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, Alert, FlatList, Text, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../types/Navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ProjectCard } from "../components/ProjectCard";
import { getInitialsFromArray } from "../utils/stringUtils"; 
import { EmptyState } from '../components/EmptyState'; 
import { ProjectType } from "../types/ProjectType";

const polvo_pescando = require('../assets/polvo_pescando.png');

type ProjectScreenNavigationProp  = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>, 
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [search, setSearch] = useState('');

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

    const handleAddProject = (newProjectData: { title: string; description: string; teamMembers: string[] }) => {
        const now = Date.now();
        const newProject = {
            id: String(now), // Gera um ID único baseado no tempo atual
            ...newProjectData,
            lastUpdated: now, 
        };
        setProjects(currentProjects => [newProject, ...currentProjects]); // aqui adiciona o novo projeto no início da lista
    };

    const handleNewProject = () => {
        navigation.navigate('ProjectForm', { onAddProject: handleAddProject });
    };

    const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <SafeAreaView style={ styles.container }>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <SearchBar 
                title="Seus Territórios"
                placeholder="Pesquisar Projetos"
                onChangeText={setSearch}
            />
            <FlatList
                data={filteredProjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProjectCard
                        project={item}
                        onPress={() => Alert.alert('Navegar para', item.title)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <EmptyState
                        imageSource={polvo_pescando}
                        title="Nenhum Projeto Encontrado"
                        subtitle="Clique em + para adicionar um novo projeto."
                    />
                }
            />
            <View style={ styles.addButtonContainer }>
                <NewItemButton 
                    onPress={handleNewProject}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
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
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptySubText: {
        color: '#A9A9A9',
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
});
import React, { useState } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../types/Navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ProjectCard } from "../components/ProjectCard";


type ProjectScreenNavigationProp  = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>, 
  NativeStackScreenProps<RootStackParamList>
>;



export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    const [projects, setProjects] = useState<any[]>([]);

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
        const newProject = {
            id: String(Date.now()), // Gera um ID único baseado no tempo atual
            ...newProjectData,
            lastUpdated: 'agora', 
        };
        setProjects(currentProjects => [newProject, ...currentProjects]); // aqui adiciona o novo projeto no início da lista
    };

    const handleNewProject = () => {
    navigation.navigate('ProjectForm', { onAddProject: handleAddProject });
};

    

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
                // value=""
                // onChangeText={}
                // onSearch={}
            />

            <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProjectCard
                        title={item.title}
                        description={item.description}
                        lastUpdated={item.lastUpdated}
                        teamMembers={item.teamMembers}
                        onPress={() => Alert.alert('Navegar para', item.title)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
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
        paddingHorizontal: 15,
    },
    addButtonContainer: {
        position: 'absolute', 
        right: 25,           
        bottom: 25,          
    },
});
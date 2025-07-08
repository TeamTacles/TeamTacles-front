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
import { EmptyState } from '../components/EmptyState';
import { useAppContext } from "../contexts/AppContext"; 
const polvo_pescando = require('../assets/polvo_pescando.png');

type ProjectScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    const { projects } = useAppContext(); 
    const [search, setSearch] = useState('');

    const userWithAvatar = {
        initials: 'CD',
    };

    const handleProfilePress = () => {
        Alert.alert("Perfil Clicado!");
    };

    const handleNotificationsPress = () => {
        Alert.alert("Notificações Clicadas!");
    };
    
    const handleNewProject = () => {
        navigation.navigate('ProjectForm'); 
    };

    const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <SafeAreaView style={styles.container}>
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
            <View style={styles.addButtonContainer}>
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
});
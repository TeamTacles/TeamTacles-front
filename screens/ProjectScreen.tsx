import React, { useState } from "react";

import { Header } from "../components/Header";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";

type ProjectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProjectForm'>;

export const ProjectScreen = () => {
    const navigation = useNavigation<ProjectScreenNavigationProp>();

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

    const handleNewProject = () => {
        navigation.navigate('ProjectForm');
    }

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
    addButtonContainer: {
        position: 'absolute', 
        right: 25,           
        bottom: 25,          
    },
});
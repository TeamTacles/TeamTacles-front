import React, { useState } from "react";

import { Header } from "../components/Header";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../types/Navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

type ProjectScreenNavigationProp  = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>, 
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
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
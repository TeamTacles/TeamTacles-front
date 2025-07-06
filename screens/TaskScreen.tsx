import React, { useState } from "react";

import { Header } from "../components/Header";
import { View, StyleSheet, Image, Text, Alert, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";

export const TaskScreen = () => {

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

    return (
        <SafeAreaView style={ styles.safeAreaView }>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <View>
                <SearchBar 
                    title="Suas tarefas"
                    placeholder="Pesquisar Tarefas"
                    // value=""
                    // onChangeText={}
                    // onSearch={}
                />
            </View>
            <View style={ styles.addButtonContainer }>
                <NewItemButton 
                    onPress={handleProfilePress}
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
    addButtonContainer: {
        position: 'absolute', 
        right: 25,           
        bottom: 25,          
    },
});
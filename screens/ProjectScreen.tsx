import React, { useState } from "react";

import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { View, StyleSheet, Image, Text, Alert, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProjectScreen = () => {

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
        <SafeAreaView style={ style.safeAreaView }>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <View>
                <SearchBar 
                    title="Seus territórios"
                    placeholder="Pesquisar Projetos"
                    // value=""
                    // onChangeText={}
                    // onSearch={}
                />
            </View>
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    safeAreaView: {
        flex: 1, 
        backgroundColor: '#191919'
    },
});
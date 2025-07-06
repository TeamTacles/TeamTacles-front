import React, { useState } from "react";

import { Header } from "../components/Header";
import { View, StyleSheet, Image, Text, Alert, StatusBar } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from "../types/Navigation";

type MenuScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Menu'>;

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
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    safeAreaView: {
        flex: 1, 
        backgroundColor: '#191919'
    },
});
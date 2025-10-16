import React, { useState } from "react";

import { Header } from "../../../components/common/Header";
import { View, StyleSheet, Image, Text, Alert, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from "../../../components/common/EmptyState";

const mascot_isEmpty = require('../../../assets/polvo_bau.png')

export const InProgressScreen = () => {

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
            <EmptyState
                imageSource={mascot_isEmpty}
                title="Estamos à procura do tesouro!"
                subtitle="Estamos trabalhando para tirar esse baú do fundo do mar!"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1, 
        backgroundColor: '#191919',
    },
    containerScreen: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
        

    },
    imagemMascot: {
        width: 80,
        height: 80,
        marginBottom: 30
    },
    text: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center'
    }
});
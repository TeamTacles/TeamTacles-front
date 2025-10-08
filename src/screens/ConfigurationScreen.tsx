import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, LayoutAnimation, UIManager, Platform, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseCard } from "../components/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation'; 
import { useAppContext } from '../contexts/AppContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ConfigurationScreen = () => {
    const { signOut } = useAppContext(); 

    type ConfigurationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
    const navigation = useNavigation<ConfigurationScreenNavigationProp>();

    const [isProfileExpanded, setProfileExpanded] = useState(false);

    const user = {
        name: 'Caio Dib',
        initials: 'CD',
    };

    const toggleProfileExpansion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setProfileExpanded(!isProfileExpanded);
    };

    const handleLogout = () => {
        Alert.alert(
            "Sair da Conta",
            "Você tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                // --- A ÚNICA CORREÇÃO ESTÁ AQUI ---
                { text: "Sair", style: "destructive", onPress: signOut }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeAreaView} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileCircle}>
                    <Text style={styles.profileInitials}>{user.initials}</Text>
                </View>
                <Text style={styles.profileName}>{user.name}</Text>

                <View style={styles.menuContainer}>
                    <Text style={styles.sectionTitle}>Conta</Text>
                    <View style={styles.menuItemGroup}>
                        <BaseCard onPress={toggleProfileExpansion} style={styles.cardOverride}>
                            <View style={styles.menuItemContent}>
                                <Icon name="person-outline" size={24} color="#fff" />
                                <Text style={styles.menuItemText}>Perfil</Text>
                                <Icon name={isProfileExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={24} color="#fff" />
                            </View>
                        </BaseCard>
                        {isProfileExpanded && (
                            <TouchableOpacity 
                                style={styles.subMenuItem} 
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <Icon name="pencil-outline" size={24} color="#fff" />
                                <Text style={styles.subMenuItemText}>Editar</Text>                               
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.sectionTitle}>Geral</Text>
                    <BaseCard style={[styles.cardOverride, styles.disabledMenuItem]} disabled>
                        <View style={styles.menuItemContent}>
                            <Icon name="notifications-outline" size={24} color="#888" />
                            <Text style={[styles.menuItemText, styles.disabledText]}>Notificações</Text>
                        </View>
                    </BaseCard>
                    <BaseCard style={[styles.cardOverride, styles.disabledMenuItem]} disabled>
                        <View style={styles.menuItemContent}>
                            <Icon name="contrast-outline" size={24} color="#888" />
                            <Text style={[styles.menuItemText, styles.disabledText]}>Aparência</Text>
                        </View>
                    </BaseCard>
                    <BaseCard style={[styles.cardOverride, styles.disabledMenuItem]} disabled>
                        <View style={styles.menuItemContent}>
                            <Icon name="settings-outline" size={24} color="#888" />
                            <Text style={[styles.menuItemText, styles.disabledText]}>Configurações</Text>
                        </View>
                    </BaseCard>

                    <Text style={styles.sectionTitle}>Sobre</Text>
                    <BaseCard style={[styles.cardOverride, styles.disabledMenuItem]} disabled>
                        <View style={styles.menuItemContent}>
                            <Icon name="cloud-upload-outline" size={24} color="#888" />
                            <Text style={[styles.menuItemText, styles.disabledText]}>Atualizações</Text>
                        </View>
                    </BaseCard>
                    <BaseCard style={[styles.cardOverride, styles.disabledMenuItem]} disabled>
                        <View style={styles.menuItemContent}>
                            <Icon name="shield-checkmark-outline" size={24} color="#888" />
                            <Text style={[styles.menuItemText, styles.disabledText]}>Políticas do TeamTacles</Text>
                        </View>
                    </BaseCard>

                    <BaseCard onPress={handleLogout} style={[styles.cardOverride, styles.logoutButton]}>
                        <View style={styles.menuItemContent}>
                            <Icon name="log-out-outline" size={24} color="#ff4545" />
                            <Text style={[styles.menuItemText, styles.logoutButtonText]}>Sair</Text>
                        </View>
                    </BaseCard>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: '#191919',
    },
    scrollContainer: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20, 
        paddingHorizontal: 20,
    },
    profileCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EB5F1C',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileInitials: {
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: 'bold',
    },
    profileName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    menuContainer: {
        width: '100%',
    },
    sectionTitle: {
        color: '#A9A9A9',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginLeft: 15,
        marginBottom: 10,
        marginTop: 15,
    },
    menuItemGroup: {
        marginBottom: 10,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#2A2A2A',
    },
    cardOverride: {
        marginBottom: 0,
        backgroundColor: '#2A2A2A',
        elevation: 0,
        shadowOpacity: 0,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 15,
    },
    menuItemText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
    },
    subMenuItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 15,
        paddingLeft: 15,
        backgroundColor: '#383838',
    },
    subMenuItemText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    disabledMenuItem: {
        marginBottom: 12,
        opacity: 0.5,
    },
    disabledText: {
        color: '#888',
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 69, 69, 0.15)', 
        borderColor: 'rgba(255, 69, 69, 0.25)',
        borderWidth: 1,
    },
    logoutButtonText: {
        color: '#ff4545', 
        fontWeight: 'bold'
    },
});
import React, { useState, useRef } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types/Navigation';
import { MemberListItem } from '../components/MemberListItem';
import { Header } from '../components/Header';
import { EditTeamModal } from '../components/EditTeamModal';
import { EditMemberRoleModal, MemberData } from '../components/EditMemberRoleModal';

import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';

type TeamDetailScreenRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;

export const TeamDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<TeamDetailScreenRouteProp>();
    
    const [team, setTeam] = useState(route.params.team);
    const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
    const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

    const notificationRef = useRef<NotificationPopupRef>(null);

    const fullMembers: MemberData[] = [
        { name: 'Caio Dib', role: 'OWNER', email: 'caio.dib@email.com' },
        { name: 'João Victor', role: 'ADMIN', email: 'joao.victor@email.com' },
        { name: 'Ana Mello', role: 'MEMBER', email: 'ana.mello@email.com' },
    ];
    
    const userWithAvatar = { initials: 'CD' };
    const handleProfilePress = () => Alert.alert("Perfil Clicado!");
    const handleNotificationsPress = () => Alert.alert("Notificações Clicadas!");

    const handleSaveTeam = (updatedData: { title: string; description: string }) => {
        setTeam(prev => ({ ...prev!, ...updatedData })); 
        setEditTeamModalVisible(false);
        notificationRef.current?.show({
            type: 'success',
            message: 'Equipe atualizada com sucesso!',
        });
    };

    const handleMemberPress = (member: MemberData) => {
        setSelectedMember(member);
        setEditMemberModalVisible(true);
    };

    const handleSaveMemberRole = (newRole: MemberData['role']) => {
        try {
            if (newRole === 'ADMIN') {
                throw new Error("Você não tem permissão para promover para Administrador.");
            }
            
            setEditMemberModalVisible(false);
            notificationRef.current?.show({
                type: 'success',
                message: `Cargo de ${selectedMember?.name} atualizado!`,
            });
        } catch (error: any) {
            setEditMemberModalVisible(false);
            notificationRef.current?.show({
                type: 'error',
                message: error.message || "Ocorreu um erro ao atualizar o cargo.",
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={userWithAvatar} onPressProfile={handleProfilePress} notificationCount={7} onPressNotifications={handleNotificationsPress} />
            
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{team.title}</Text>
                <TouchableOpacity onPress={() => setEditTeamModalVisible(true)}>
                    <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {team.description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, styles.titleDescription]}>Descrição</Text>
                        <Text style={styles.descriptionText}>{team.description}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Participantes ({fullMembers.length})</Text>
                    {fullMembers.map((member, index) => (
                        <MemberListItem 
                            key={index} 
                            name={member.name} 
                            role={member.role} 
                            onPress={() => handleMemberPress(member)}
                        />
                    ))}
                </View>
            </ScrollView>

            <EditTeamModal
                visible={isEditTeamModalVisible}
                team={team}
                onClose={() => setEditTeamModalVisible(false)}
                onSave={handleSaveTeam}
            />
            <EditMemberRoleModal
                visible={isEditMemberModalVisible}
                member={selectedMember}
                onClose={() => setEditMemberModalVisible(false)}
                onSave={handleSaveMemberRole}
            />
            
            <NotificationPopup ref={notificationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#191919' 
    },
    pageHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 15, 
        paddingVertical: 15, 
        marginBottom:25
    },
    backButton: { 
        marginRight: 15 
    },
    headerTitle: { 
        color: '#EB5F1C', 
        fontSize: 24, 
        fontWeight: 'bold', 
        flex: 1 
    },
    scrollContainer: { 
        paddingHorizontal: 20, 
        paddingBottom: 20 
    },
    section: { 
        marginBottom: 30 
    },
    sectionTitle: { 
        color: '#EB5F1C', 
        fontSize: 16, 
        fontWeight: 'bold', 
        textTransform: 'uppercase', 
        marginBottom: 15 
    },
    titleDescription: {
        color: '#FFFFFFFF'
    },
    descriptionText: { 
        color: '#E0E0E0', 
        fontSize: 16, 
        lineHeight: 24 
    },
});
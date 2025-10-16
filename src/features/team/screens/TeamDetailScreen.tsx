// src/screens/TeamDetailScreen.tsx

import React, { useState, useRef } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../../types/navigation';
import { MemberListItem } from '../components/MemberListItem';
import { Header } from '../../../components/common/Header';
import { EditTeamModal } from '../components/EditTeamModal';
import { EditMemberRoleModal, MemberData } from '../components/EditMemberRoleModal';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'; // Importe o ConfirmationModal
import { TeamType } from '../../../types/entities';

type TeamDetailScreenRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;
type MemberRole = 'ADMIN' | 'MEMBER';

export const TeamDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<TeamDetailScreenRouteProp>();
    
    const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('OWNER');
    const [team, setTeam] = useState(route.params.team);
    const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Estado para o modal de confirmação
    const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
    const [isInviteModalVisible, setInviteModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
    
    const [members, setMembers] = useState<MemberData[]>([
        { name: 'Caio Dib', role: 'OWNER', email: 'caio.dib@email.com' },
        { name: 'João Victor', role: 'ADMIN', email: 'joao.victor@email.com' },
        { name: 'Ana Mello', role: 'MEMBER', email: 'ana.mello@email.com' },
    ]);

    const notificationRef = useRef<NotificationPopupRef>(null);
    
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

    const handleConfirmDeleteTeam = () => {
        setConfirmDeleteVisible(false);
        setEditTeamModalVisible(false);
        
        navigation.goBack();
        
        setTimeout(() => {
            notificationRef.current?.show({ type: 'success', message: 'Equipe excluída com sucesso!' });
        }, 500);
    };

    const handleMemberPress = (member: MemberData) => {
        setSelectedMember(member);
        setEditMemberModalVisible(true);
    };

    const handleSaveMemberRole = (newRole: MemberData['role']) => {
        // ... (lógica existente)
    };
    
    const handleInviteByEmail = (email: string, role: MemberRole) => {
        // ... (lógica existente)
        notificationRef.current?.show({
            type: 'success',
            message: `Convite enviado para ${email}!`,
        });
    };

    const handleDeleteMember = () => {
        // ... (lógica existente)
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={userWithAvatar} onPressProfile={handleProfilePress} notificationCount={7} onPressNotifications={handleNotificationsPress} />
            
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <Text style={styles.headerText} numberOfLines={1}>Detalhes da Equipe</Text>
                <TouchableOpacity onPress={() => setEditTeamModalVisible(true)}>
                    <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {team.description && (
                    <View style={styles.section}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{team.title}</Text>
                        <Text style={[styles.sectionTitle, styles.titleDescription]}>Descrição</Text>
                        <Text style={styles.descriptionText}>{team.description}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.participantsHeader}>
                        <Text style={styles.sectionTitle}>Participantes ({members.length})</Text>
                        <TouchableOpacity onPress={() => setInviteModalVisible(true)}>
                            <Icon name="person-add-outline" size={24} color="#EB5F1C" />
                        </TouchableOpacity>
                    </View>
                    {members.map((member, index) => (
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
                onDelete={() => setConfirmDeleteVisible(true)} // Abre o modal de confirmação
            />

            <ConfirmationModal
                visible={isConfirmDeleteVisible}
                title="Excluir Equipe"
                message={`Você tem certeza que deseja excluir a equipe "${team.title}"? Esta ação não pode ser desfeita.`}
                onClose={() => setConfirmDeleteVisible(false)}
                onConfirm={handleConfirmDeleteTeam}
                confirmText="Excluir"
            />
            
            <EditMemberRoleModal
                visible={isEditMemberModalVisible}
                member={selectedMember}
                currentUserRole={currentUserRole}
                onClose={() => setEditMemberModalVisible(false)}
                onSave={handleSaveMemberRole}
                onDelete={handleDeleteMember}
            />
            
            <InviteMemberModal
                visible={isInviteModalVisible}
                onClose={() => setInviteModalVisible(false)}
                onInviteByEmail={handleInviteByEmail}
                inviteLink={`https://teamtacles.com/join/${team.id}`} 
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
        marginBottom:10
    },
    backButton: { 
        marginRight: 15 
    },
    headerText:{
        color: '#FFFFFF', 
        fontSize: 24, 
        fontWeight: 'bold', 
        flex: 1 
    },
    headerTitle: { 
        color: '#EB5F1C', 
        fontSize: 24, 
        fontWeight: 'bold', 
        flex: 1,
        marginBottom: 20
    },
    scrollContainer: { 
        paddingHorizontal: 20, 
        paddingBottom: 20 
    },
    section: { 
        marginBottom: 30 
    },
    participantsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: { 
        color: '#EB5F1C', 
        fontSize: 16, 
        fontWeight: 'bold', 
        textTransform: 'uppercase', 
    },
    titleDescription: {
        color: '#FFFFFFFF',
        marginBottom: 15,
    },
    descriptionText: { 
        color: '#E0E0E0', 
        fontSize: 16, 
        lineHeight: 24 
    },
});
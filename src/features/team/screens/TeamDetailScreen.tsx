import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { MemberListItem } from '../components/MemberListItem';
import { Header } from '../../../components/common/Header';
import { EditTeamModal } from '../components/EditTeamModal';
import { EditMemberRoleModal } from '../components/EditMemberRoleModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { useTeamDetail } from '../hooks/useTeamDetail';
import { useAppContext } from '../../../contexts/AppContext'; 
import { EmptyState } from '../../../components/common/EmptyState';
import NotificationPopup from '../../../components/common/NotificationPopup';

const mascot_isEmpty = require('../../../assets/polvo_bau.png');

export const TeamDetailScreen = () => {
    const { user } = useAppContext();
    const {
        navigation,
        team,
        members,
        loadingMembers,
        refreshingMembers,
        initialLoading,
        isDeleting,
        modalNotificationRef,
        currentUserRole,
        isOwner,
        isAdmin,
        
        isEditTeamModalVisible, setEditTeamModalVisible,
        isConfirmDeleteVisible, setConfirmDeleteVisible,
        isEditMemberModalVisible, setEditMemberModalVisible,
        isInviteModalVisible, setInviteModalVisible,
        selectedMember, setSelectedMember,
        isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible,
        isConfirmLeaveVisible, setConfirmLeaveVisible,
        
        handleLeaveTeam,
        handleRefresh,
        handleLoadMore,
        handleUpdateTeam,
        handleDeleteTeam,
        handleSelectMember,
        handleUpdateMemberRole,
        handleRemoveMember,
    } = useTeamDetail();

    const userProfileForHeader = user ? { initials: user.initials, name: user.name } : null;
    const handleProfilePress = () => navigation.navigate('EditProfile');
    
    if (initialLoading) {
      return (
        <SafeAreaView style={styles.container}>
            <Header userProfile={userProfileForHeader} onPressProfile={() => {}} notificationCount={0} onPressNotifications={() => {}} />
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EB5F1C" />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
            </View>
        </SafeAreaView>
      );
    }

    const ListHeader = () => (
        <>
            <View style={styles.headerContent}>
                <Text style={styles.teamTitle} numberOfLines={1}>{team.title || (team as any).name}</Text>
                {team.description && <Text style={styles.descriptionText}>{team.description}</Text>}
            </View>
            <View style={styles.participantsHeader}>
                <Text style={styles.sectionTitle}>Participantes ({members?.length ?? 0})</Text>
                {isAdmin && (
                    <TouchableOpacity onPress={() => setInviteModalVisible(true)}>
                        <Icon name="person-add-outline" size={24} color="#EB5F1C" />
                    </TouchableOpacity>
                )}
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={userProfileForHeader} onPressProfile={handleProfilePress} notificationCount={0} onPressNotifications={() => {}} />

            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <Text style={styles.headerText} numberOfLines={1}>Detalhes da Equipe</Text>

                <View style={styles.actionIconsContainer}>
                    {isOwner && (
                        <TouchableOpacity onPress={() => setEditTeamModalVisible(true)} style={styles.actionIcon}>
                            <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setConfirmLeaveVisible(true)} style={styles.actionIcon}>
                        <Icon name="log-out-outline" size={24} color="#ff4545" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={members}
                keyExtractor={(item) => item.userId.toString()}
                onRefresh={handleRefresh}
                refreshing={refreshingMembers}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5} 
                ListHeaderComponent={ListHeader} 
                renderItem={({ item }) => (
                    <MemberListItem
                        name={item.username}
                        role={item.teamRole}
                        onPress={() => handleSelectMember(item)}
                        disabled={!isAdmin}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState 
                        imageSource={mascot_isEmpty} 
                        title="Nenhum membro encontrado" 
                        subtitle="Convide pessoas para começar a colaborar."
                    />
                }
                ListFooterComponent={loadingMembers && !refreshingMembers ? <ActivityIndicator style={{ margin: 20 }} color="#EB5F1C" /> : <View style={{ height: 20 }} />}
                contentContainerStyle={styles.scrollContainer}
            />

            <EditTeamModal
                visible={isEditTeamModalVisible}
                team={team}
                onClose={() => setEditTeamModalVisible(false)}
                onSave={handleUpdateTeam}
                onDelete={() => setConfirmDeleteVisible(true)}
                isOwner={isOwner}
            />

            <EditMemberRoleModal
                visible={isEditMemberModalVisible}
                member={selectedMember ? { 
                    name: selectedMember.username, 
                    email: selectedMember.email || '', 
                    role: selectedMember.teamRole as 'OWNER' | 'ADMIN' | 'MEMBER'
                } : null}
                currentUserRole={currentUserRole || 'MEMBER'}
                onClose={() => setEditMemberModalVisible(false)}
                onSave={handleUpdateMemberRole} 
                onDelete={() => {
                    setEditMemberModalVisible(false);
                    setTimeout(() => setConfirmRemoveMemberVisible(true), 300);
                }}
            />

            <ConfirmationModal
                visible={isConfirmDeleteVisible}
                title="Excluir Equipe"
                message={`Você tem certeza que deseja excluir a equipe "${team.title || (team as any).name}"? Esta ação não pode ser desfeita.`}
                onClose={() => setConfirmDeleteVisible(false)}
                onConfirm={handleDeleteTeam}
                confirmText="Excluir"
                isConfirming={isDeleting}
                confirmingText="Excluindo..."
                disableClose={isDeleting}
            />

            <ConfirmationModal
                visible={isConfirmRemoveMemberVisible}
                title="Remover Membro"
                message={`Você tem certeza que deseja remover ${selectedMember?.username} da equipe?`}
                onClose={() => setConfirmRemoveMemberVisible(false)}
                onConfirm={handleRemoveMember}
                confirmText="Remover"
                isConfirming={false}
                confirmingText="Removendo..."
            />

            <InviteMemberModal
                visible={isInviteModalVisible}
                onClose={() => setInviteModalVisible(false)}
                teamId={team.id}
                notificationRef={modalNotificationRef}
            />

            <ConfirmationModal
                visible={isConfirmLeaveVisible}
                title="Sair da Equipe"
                message={`Deseja sair de "${team.title || (team as any).name}"?`}
                onClose={() => setConfirmLeaveVisible(false)}
                onConfirm={handleLeaveTeam}
                confirmText="Sair"
                isConfirming={isDeleting}
                confirmingText="Saindo..."
                disableClose={isDeleting}
            />
            
            <NotificationPopup ref={modalNotificationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#A9A9A9',
        fontSize: 16,
    },
    pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, marginBottom:10 },
    backButton: { marginRight: 15 },
    headerText:{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10 },
    actionIconsContainer: { 
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        padding: 5, 
        marginLeft: 10, 
    },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    headerContent: { marginBottom: 30 },
    teamTitle: { color: '#EB5F1C', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    descriptionText: { color: '#E0E0E0', fontSize: 16, lineHeight: 24, flexShrink: 1 },
    participantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#3C3C3C', paddingBottom: 10 }, 
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
// src/features/team/screens/TeamDetailScreen.tsx
import React from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { MemberListItem } from '../components/MemberListItem';
import { Header } from '../../../components/common/Header';
import { EditTeamModal } from '../components/EditTeamModal';
import { EditMemberRoleModal } from '../components/EditMemberRoleModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { useTeamDetail } from '../hooks/useTeamDetail';

export const TeamDetailScreen = () => {
    const {
        navigation,
        team,
        members,
        loading,
        refreshing,
        isDeleting,
        // --- INÍCIO DA CORREÇÃO: Obter a ref para o modal ---
        modalNotificationRef, 
        // --- FIM DA CORREÇÃO ---
        currentUserRole,
        isOwner,
        isAdmin,
        isEditTeamModalVisible, setEditTeamModalVisible,
        isConfirmDeleteVisible, setConfirmDeleteVisible,
        isEditMemberModalVisible, setEditMemberModalVisible,
        isInviteModalVisible, setInviteModalVisible,
        selectedMember,
        isConfirmRemoveMemberVisible, setConfirmRemoveMemberVisible,
        handleRefresh,
        handleLoadMore,
        handleUpdateTeam,
        handleDeleteTeam,
        handleSelectMember,
        handleUpdateMemberRole,
        handleRemoveMember,
    } = useTeamDetail();
    
    const userWithAvatar = { initials: 'CD' };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={userWithAvatar} onPressProfile={() => {}} notificationCount={0} onPressNotifications={() => {}} />
            
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <Text style={styles.headerText} numberOfLines={1}>Detalhes da Equipe</Text>
                {isOwner && (
                    <TouchableOpacity onPress={() => setEditTeamModalVisible(true)}>
                        <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={members}
                keyExtractor={(item) => item.userId.toString()}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <>
                        <View style={styles.headerContent}>
                            <Text style={styles.teamTitle} numberOfLines={1}>{team.title}</Text>
                            {team.description && <Text style={styles.descriptionText}>{team.description}</Text>}
                        </View>
                        <View style={styles.participantsHeader}>
                            <Text style={styles.sectionTitle}>Participantes ({members.length})</Text>
                            {isAdmin && (
                                <TouchableOpacity onPress={() => setInviteModalVisible(true)}>
                                    <Icon name="person-add-outline" size={24} color="#EB5F1C" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <MemberListItem 
                        name={item.username} 
                        role={item.teamRole} 
                        onPress={() => handleSelectMember(item)}
                        disabled={!isAdmin}
                    />
                )}
                ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={{ margin: 20 }} color="#EB5F1C" /> : null}
                contentContainerStyle={styles.scrollContainer}
            />

            {isOwner && (
                <EditTeamModal
                    visible={isEditTeamModalVisible}
                    team={team}
                    onClose={() => setEditTeamModalVisible(false)}
                    onSave={handleUpdateTeam}
                    onDelete={() => setConfirmDeleteVisible(true)}
                    isOwner={isOwner}
                />
            )}

            <ConfirmationModal
                visible={isConfirmDeleteVisible}
                title="Excluir Equipe"
                message={`Você tem certeza que deseja excluir a equipe "${team.title}"? Esta ação não pode ser desfeita.`}
                onClose={() => setConfirmDeleteVisible(false)}
                onConfirm={handleDeleteTeam}
                confirmText="Excluir"
                isConfirming={isDeleting}
                confirmingText="Excluindo..."
                disableClose={isDeleting}
            />
            
            <EditMemberRoleModal
                visible={isEditMemberModalVisible}
                member={selectedMember ? { name: selectedMember.username, email: selectedMember.email, role: selectedMember.teamRole } : null}
                currentUserRole={currentUserRole!}
                onClose={() => setEditMemberModalVisible(false)}
                onSave={handleUpdateMemberRole}
                onDelete={() => setConfirmRemoveMemberVisible(true)}
            />

            <ConfirmationModal
                visible={isConfirmRemoveMemberVisible}
                title="Remover Membro"
                message={`Você tem certeza que deseja remover ${selectedMember?.username} da equipe?`}
                onClose={() => setConfirmRemoveMemberVisible(false)}
                onConfirm={handleRemoveMember}
                confirmText="Remover"
            />
            
            {isAdmin && (
                <InviteMemberModal
                    visible={isInviteModalVisible}
                    onClose={() => setInviteModalVisible(false)}
                    teamId={team.id}
                    // --- INÍCIO DA CORREÇÃO: Passar a ref para o modal ---
                    notificationRef={modalNotificationRef}
                    // --- FIM DA CORREÇÃO ---
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, marginBottom:10 },
    backButton: { marginRight: 15 },
    headerText:{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', flex: 1 },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    headerContent: { marginBottom: 30 },
    teamTitle: { color: '#EB5F1C', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    descriptionText: { color: '#E0E0E0', fontSize: 16, lineHeight: 24, flexShrink: 1 },
    participantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
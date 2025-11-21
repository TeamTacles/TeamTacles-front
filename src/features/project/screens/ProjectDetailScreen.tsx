import React, { useState, useMemo, useRef, ElementRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../types/Navigation';
import { Header } from '../../../components/common/Header';
import { MemberListItem } from '../../team/components/MemberListItem';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { EditMemberRoleModal } from '../../team/components/EditMemberRoleModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { ProjectTaskCard } from '../../task/components/ProjectTaskCard';
import { NewItemButton } from '../../../components/common/NewItemButton';
import { NewTaskModal } from '../../task/components/NewTaskModal';
import { SelectTaskMembersModal } from '../../task/components/SelectTaskMembersModal';
import { InviteMemberModal } from '../../team/components/InviteMemberModal';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTaskCreation } from '../../task/hooks/useTaskCreation';
import { useAppContext } from '../../../contexts/AppContext';


type ProjectDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProjectDetailScreen = () => {
    const { showNotification } = useNotification();
    const { user } = useAppContext();

    const {
        navigation,
        project,
        loadingProject,
        isDeleting,
        members,
        loadingMembers,
        refreshingMembers,
        initialLoadingMembers,
        handleRefreshMembers,
        handleLoadMoreMembers,
        projectTasks,
        loadingTasks,
        refreshingTasks,
        initialLoadingTasks,
        handleRefreshTasks,
        handleLoadMoreTasks,
        addTaskLocally,
        updateTaskInList,
        removeTaskFromList,
        currentUserRole,
        isOwner,
        isAdmin,
        isEditModalVisible,
        setEditModalVisible,
        isConfirmDeleteVisible,
        setConfirmDeleteVisible,
        isEditMemberModalVisible,
        setEditMemberModalVisible,
        isInviteMemberModalVisible,
        setInviteMemberModalVisible,
        isConfirmRemoveMemberVisible,
        setConfirmRemoveMemberVisible,
        isConfirmLeaveVisible,
        setConfirmLeaveVisible,
        selectedMember,
        handleUpdateProject,
        handleDeleteProject,
        handleSelectMember,
        handleUpdateMemberRole,
        handleRemoveMember,
        handleLeaveProject,
    } = useProjectDetail();

    const [isMembersListModalVisible, setMembersListModalVisible] = useState(false);

    const {
        isNewTaskModalVisible,
        setNewTaskModalVisible,
        isSelectMembersModalVisible,
        isCreatingTask,
        handleProceedToMemberSelection,
        handleFinalizeTaskCreation,
        handleCloseSelectMembersModal
    } = useTaskCreation({
        projectId: project?.id,
        onTaskCreated: addTaskLocally
    });

    const [isSortModalVisible, setSortModalVisible] = useState(false);
    type SortOption = 'DEFAULT' | 'IN_PROGRESS' | 'TO_DO' | 'DONE' | 'OVERDUE';
    const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
    const sortButtonRef = useRef<ElementRef<typeof TouchableOpacity>>(null);
    const [sortMenuPosition, setSortMenuPosition] = useState({ top: 0, right: 0 });

    const sortOptions: { label: string; value: SortOption; color: string }[] = [
        { label: 'Padrão', value: 'DEFAULT', color: '#FFFFFF' },
        { label: 'Em andamento', value: 'IN_PROGRESS', color: '#FFD700' },
        { label: 'A fazer', value: 'TO_DO', color: '#FFA500' },
        { label: 'Concluído', value: 'DONE', color: '#3CB371' },
        { label: 'Em atraso', value: 'OVERDUE', color: '#ff4545' },
    ];

    //mudar abrodagem dessa funcao !!!!
    const sortedTasks = useMemo(() => {
        // Cria uma cópia para não mutar o estado original
        let tasksCopy = [...projectTasks];
        
        if (sortOption === 'DEFAULT') return tasksCopy;

        return tasksCopy.sort((a, b) => {
            // Lógica: Se a tarefa 'a' corresponde ao critério, ela vem antes (-1)
            // Se a tarefa 'b' corresponde, ela vem antes (1)
            
            const isAMatch = (sortOption === 'OVERDUE') 
                ? a.status === 'OVERDUE'
                : (a.originalStatus || a.status) === sortOption;

            const isBMatch = (sortOption === 'OVERDUE')
                ? b.status === 'OVERDUE'
                : (b.originalStatus || b.status) === sortOption;

            if (isAMatch && !isBMatch) return -1; // 'a' sobe
            if (!isAMatch && isBMatch) return 1;  // 'b' sobe
            return 0; // Mantém a ordem relativa se ambos forem iguais
        });
        
    }, [sortOption, projectTasks]);

    const handleSort = (option: SortOption) => {
        setSortOption(option);
        setSortModalVisible(false);
    };

    const openSortMenu = () => {
        sortButtonRef.current?.measure((_fx, _fy, _width, height, _px, py) => {
            setSortMenuPosition({ top: py + height + 2, right: 15 });
            setSortModalVisible(true);
        });
    };

    const userProfileForHeader = user ? { initials: user.initials } : { initials: '?' };
    const handleProfilePress = () => navigation.navigate('EditProfile');

    if (loadingProject) {
        return (
            <SafeAreaView style={styles.container}>
                <Header userProfile={userProfileForHeader} onPressProfile={handleProfilePress} notificationCount={0} onPressNotifications={() => {}} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EB5F1C" />
                    <Text style={styles.loadingText}>Carregando projeto...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const initialDataLoading = initialLoadingMembers || initialLoadingTasks;

    return (
        <SafeAreaView style={styles.container}>
            <Header userProfile={userProfileForHeader} onPressProfile={handleProfilePress} notificationCount={0} onPressNotifications={() => {}} />

            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <View style={styles.projectHeaderText}>
                    <Text style={styles.titleHeaderText}>Detalhes do Projeto</Text>
                </View>

                <View style={styles.actionIconsContainer}>
                    {isOwner && (
                        <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.actionIcon}>
                            <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setConfirmLeaveVisible(true)} style={styles.actionIcon}>
                        <Icon name="log-out-outline" size={24} color="#ff4545" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.staticContent}>
                <View style={styles.projectDetails}>
                    <Text style={styles.projectTitle} numberOfLines={1}>{project?.title}</Text>
                    <Text style={styles.projectDescription}>{project?.description}</Text>
                </View>

                <View style={styles.infoBar}>
                    <TouchableOpacity style={styles.infoButton} onPress={() => project && navigation.navigate('ReportCenter', { projectId: project.id })}>
                        <Icon name="document-text-outline" size={20} color="#ffffffff" />
                        <Text style={styles.infoTitle}>Relatórios</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.infoButton} onPress={() => setMembersListModalVisible(true)}>
                        <Icon name="people-outline" size={20} color="#ffffffff" />
                        <Text style={styles.infoTitle}>Membros ({members.length})</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tasksHeader}>
                    <Text style={styles.tasksTitle}>Tarefas</Text>
                    <TouchableOpacity ref={sortButtonRef} style={styles.orderButton} onPress={openSortMenu}>
                        <Text style={styles.orderButtonText}>Ordenar por</Text>
                        <Icon name="chevron-down-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {initialDataLoading ? (
                 <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EB5F1C" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                 </View>
            ) : (
                <View style={styles.listWrapper}>
                    <FlatList
                        data={sortedTasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ProjectTaskCard
                                task={item}
                                onPress={() => project && navigation.navigate('TaskDetail', { projectId: project.id, taskId: item.id, projectRole: currentUserRole, onTaskUpdate: updateTaskInList, onTaskDelete: removeTaskFromList})}
                            />
                        )}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa encontrada para este projeto.</Text>}
                        onRefresh={handleRefreshTasks}
                        refreshing={refreshingTasks}
                        onEndReached={handleLoadMoreTasks}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loadingTasks && !refreshingTasks ? <ActivityIndicator style={{ margin: 20 }} color="#EB5F1C" /> : null}
                    />
                </View>
            )}

            <View style={styles.addButtonContainer}>
                <NewItemButton onPress={() => setNewTaskModalVisible(true)} />
            </View>

            <Modal animationType="fade" transparent={true} visible={isMembersListModalVisible} onRequestClose={() => setMembersListModalVisible(false)}>
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setMembersListModalVisible(false)}>
                            <Icon name="close-outline" size={30} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Membros do Projeto</Text>

                        <View style={styles.membersListContainer}>
                            {initialLoadingMembers ? (
                                <ActivityIndicator style={{ margin: 20 }} color="#EB5F1C" />
                            ) : (
                                <FlatList
                                    data={members}
                                    keyExtractor={(item) => item.userId.toString()}
                                    renderItem={({ item }) => (
                                        <MemberListItem
                                            name={item.username}
                                            role={item.projectRole}
                                            onPress={() => {
                                                setMembersListModalVisible(false);
                                                handleSelectMember(item);
                                            }}
                                            disabled={!isAdmin}
                                        />
                                    )}
                                    onRefresh={handleRefreshMembers}
                                    refreshing={refreshingMembers}
                                    onEndReached={handleLoadMoreMembers}
                                    onEndReachedThreshold={0.5}
                                    ListFooterComponent={loadingMembers && !refreshingMembers ? <ActivityIndicator style={{ margin: 20 }} color="#EB5F1C" /> : null}
                                    ListEmptyComponent={() => <Text style={styles.emptyText}>Nenhum membro encontrado neste projeto.</Text>}
                                    ItemSeparatorComponent={() => <View style={styles.separatorLine} />}
                                />
                            )}
                        </View>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.inviteButton}
                                onPress={() => {
                                    setMembersListModalVisible(false);
                                    setInviteMemberModalVisible(true);
                                }}
                            >
                                <Icon name="person-add-outline" size={20} color="#fff" />
                                <Text style={styles.inviteButtonText}>Convidar Membro</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={isSortModalVisible} onRequestClose={() => setSortModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setSortModalVisible(false)} activeOpacity={1}>
                    <View style={[styles.sortModalView, { top: sortMenuPosition.top, right: sortMenuPosition.right }]}>
                        {sortOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.sortOption, index === sortOptions.length - 1 && styles.lastSortOption]}
                                onPress={() => handleSort(option.value)}
                            >
                                <Text style={{ color: option.color }}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <EditMemberRoleModal
                visible={isEditMemberModalVisible}
                member={selectedMember ? { name: selectedMember.username, email: selectedMember.email, role: selectedMember.projectRole } : null}
                currentUserRole={currentUserRole || 'MEMBER'}
                onClose={() => setEditMemberModalVisible(false)}
                onSave={handleUpdateMemberRole}
                onDelete={() => setConfirmRemoveMemberVisible(true)}
            />

            {isOwner && (
                <EditProjectModal
                    visible={isEditModalVisible}
                    project={project}
                    onClose={() => setEditModalVisible(false)}
                    onSave={handleUpdateProject}
                    onDelete={() => setConfirmDeleteVisible(true)}
                />
            )}

            <ConfirmationModal
                visible={isConfirmDeleteVisible}
                title="Excluir Projeto"
                message={`Você tem certeza que deseja excluir o projeto "${project?.title}"? Esta ação não pode ser desfeita.`}
                onClose={() => setConfirmDeleteVisible(false)}
                onConfirm={handleDeleteProject}
                confirmText="Excluir"
                isConfirming={isDeleting}
                confirmingText="Excluindo..."
                disableClose={isDeleting}
            />

            <ConfirmationModal
                visible={isConfirmRemoveMemberVisible}
                title="Remover Membro"
                message={`Você tem certeza que deseja remover ${selectedMember?.username} do projeto?`}
                onClose={() => setConfirmRemoveMemberVisible(false)}
                onConfirm={handleRemoveMember}
                confirmText="Remover"
            />

            <ConfirmationModal
                visible={isConfirmLeaveVisible}
                title="Sair do Projeto"
                message={`Tem certeza que deseja sair do projeto "${project?.title}"?`}
                onClose={() => setConfirmLeaveVisible(false)}
                onConfirm={handleLeaveProject}
                confirmText="Sair"
                isConfirming={isDeleting}
                confirmingText="Saindo..."
                disableClose={isDeleting}
            />

            <NewTaskModal
                visible={isNewTaskModalVisible}
                onClose={() => setNewTaskModalVisible(false)}
                onNext={handleProceedToMemberSelection}
            />

            <SelectTaskMembersModal
                visible={isSelectMembersModalVisible}
                onClose={handleCloseSelectMembersModal}
                projectMembers={members.filter(m => m.userId !== user?.id)}
                onSave={handleFinalizeTaskCreation}
                isSaving={isCreatingTask}
            />

            <InviteMemberModal
                visible={isInviteMemberModalVisible}
                onClose={() => setInviteMemberModalVisible(false)}
                projectId={project?.id}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
    backButton: { marginRight: 15 },
    titleHeaderText: {
        color: '#FFFFFF', fontSize: 24, fontWeight: 'bold'
    },
    projectHeaderText: { flex: 1 },
    actionIconsContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    actionIcon: { padding: 0},
    projectTitle: { color: '#EB5F1C', fontSize: 24, fontWeight: 'bold' },
    projectDetails: {
        gap: 10,
        marginTop: 10,
    },
    staticContent: {
        paddingHorizontal: 15,
    },
    projectDescription: { color: '#ffffffff', fontSize: 14, marginTop: 4, marginBottom: 20, lineHeight: 22 },
    infoBar: { flexDirection: 'row', marginBottom: 25, gap: 10 },
    infoButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderWidth: 2, borderColor: '#A9A9A9', borderRadius: 15 },
    infoTitle: { color: '#fff', fontSize: 17, marginLeft: 8 },
    tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    tasksTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    orderButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3C3C3C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    orderButtonText: { color: '#fff', marginRight: 5 },

    listWrapper: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 80,
    },
    emptyText: { color: '#A9A9A9', textAlign: 'center', marginTop: 50 },

    addButtonContainer: {
        position: 'absolute',
        right: 25,
        bottom: 70,
        zIndex: 1,
    },

    modalCenteredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { width: '90%', maxHeight: '70%', backgroundColor: '#2A2A2A', borderRadius: 20, paddingTop: 25, paddingBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalCloseButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center', paddingHorizontal: 25 },
    membersListContainer: { flexGrow: 1, flexShrink: 1, paddingHorizontal: 10, minHeight: 100 },
    separatorLine: { height: 1, backgroundColor: '#3C3C3C', marginHorizontal: 15 },
    sortModalView: { backgroundColor: '#3C3C3C', borderRadius: 10, position: 'absolute', width: 150, elevation: 5, overflow: 'hidden' },
    sortOption: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#555' },
    lastSortOption: { borderBottomWidth: 0 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EB5F1C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 15,
        marginHorizontal: 15,
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
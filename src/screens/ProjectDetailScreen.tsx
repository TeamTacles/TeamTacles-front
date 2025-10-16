// src/screens/ProjectDetailScreen.tsx

import React, { useState, useMemo, useRef, ElementRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { Header } from '../components/Header';
import { ProjectDetails, ProjectMember, ProjectTask, projectService } from '../services/projectService';
import { MemberListItem } from '../components/MemberListItem';
import { EditMemberRoleModal, MemberData } from '../components/EditMemberRoleModal';
import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';
import { EditProjectModal } from '../components/EditProjectModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ProjectTaskCard } from '../components/ProjectTaskCard';
import { NewItemButton } from '../components/NewItemButton';
import { NewTaskModal } from '../components/NewTaskModal';
import { SelectTaskMembersModal } from '../components/SelectTaskMembersModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { getInviteErrorMessage } from '../utils/errorHandler';

type ProjectDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

const MOCK_MEMBERS: ProjectMember[] = [
    { userId: 1, username: 'Caio Dib', email: 'caio@email.com', projectRole: 'OWNER' },
    { userId: 2, username: 'Pedro L.', email: 'pedro@email.com', projectRole: 'ADMIN' },
    { userId: 3, username: 'João S.', email: 'joao@email.com', projectRole: 'MEMBER' },
    { userId: 4, username: 'Ana M.', email: 'ana@email.com', projectRole: 'MEMBER' },
];

const MOCK_INITIAL_TASKS: ProjectTask[] = [
    { id: 101, title: 'Protótipo das Telas', description: 'Protótipos de telas no Figma', status: 'IN_PROGRESS', dueDate: '2025-06-26T00:00:00Z', ownerId: 1, assignments: [{ userId: 1, username: 'Caio Dib'}, { userId: 4, username: 'Ana M.'}] },
    { id: 102, title: 'README.md', description: 'Documentação inicial do projeto', status: 'TO_DO', dueDate: '2025-05-28T00:00:00Z', ownerId: 2, assignments: [{ userId: 2, username: 'Pedro L.'}, { userId: 3, username: 'João S.'}] },
    { id: 103, title: 'Configuração do Ambiente', description: 'Descrição longa para testar o layout de quebra de linha no card da tarefa.', status: 'DONE', dueDate: '2025-05-20T00:00:00Z', ownerId: 1, assignments: [{ userId: 1, username: 'Caio Dib'}, { userId: 2, username: 'Pedro L.'}] },
    { id: 104, title: 'Tarefa Atrasada', description: 'Esta tarefa está atrasada.', status: 'TO_DO', dueDate: '2020-01-01T00:00:00Z', ownerId: 1, assignments: [{ userId: 1, username: 'Caio Dib' }] },
    { id: 105, title: 'Mais uma tarefa', description: 'Para preencher a lista.', status: 'TO_DO', dueDate: '2025-12-31T00:00:00Z', ownerId: 3, assignments: [{ userId: 3, username: 'João S.' }] },
];


export const ProjectDetailScreen = () => {
    const navigation = useNavigation<ProjectDetailNavigationProp>();
    const route = useRoute<ProjectDetailRouteProp>();
    const { projectId } = route.params;
    const notificationRef = useRef<NotificationPopupRef>(null);

    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loadingProject, setLoadingProject] = useState(true);
    const [tasks, setTasks] = useState<ProjectTask[]>(MOCK_INITIAL_TASKS);
    
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [isMembersListModalVisible, setMembersListModalVisible] = useState(false);
    const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
    const [isInviteMemberModalVisible, setInviteMemberModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('OWNER');
    
    const [isNewTaskModalVisible, setNewTaskModalVisible] = useState(false);
    const [isSelectMembersModalVisible, setSelectMembersModalVisible] = useState(false);
    const [newTaskData, setNewTaskData] = useState<{ title: string; description: string; dueDate: Date } | null>(null);

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
    
    const sortedTasks = useMemo(() => {
        let currentTasks = [...tasks];
        if (sortOption === 'DEFAULT') return currentTasks;
        if (sortOption === 'OVERDUE') {
            return currentTasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'DONE');
        }
        return currentTasks.filter(task => task.status === sortOption);
    }, [sortOption, tasks]);
    
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

    const [members, setMembers] = useState<MemberData[]>(MOCK_MEMBERS.map(m => ({ name: m.username, email: m.email, role: m.projectRole })));
    const userWithAvatar = { initials: 'CD' };

    // Carrega os dados do projeto via API
    useEffect(() => {
        const loadProjectData = async () => {
            try {
                setLoadingProject(true);
                const projectData = await projectService.getProjectById(projectId);
                setProject(projectData);
            } catch (error) {
                notificationRef.current?.show({
                    type: 'error',
                    message: 'Erro ao carregar o projeto. Tente novamente.'
                });
                // Volta para a tela anterior se falhar
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } finally {
                setLoadingProject(false);
            }
        };

        loadProjectData();
    }, [projectId]);

    const handleMemberPress = (member: MemberData) => { 
        setSelectedMember(member);
        setEditMemberModalVisible(true);
    };
    const handleSaveMemberRole = (newRole: MemberData['role']) => { /* ... */ };
    const handleDeleteMember = () => { /* ... */ };

    const handleSaveProjectDetails = async (updatedData: { title: string; description: string }) => {
        if (!project) return;

        try {
            const updatedProject = await projectService.updateProject(project.id, updatedData);
            setProject(updatedProject);
            setEditModalVisible(false);
            notificationRef.current?.show({ type: 'success', message: 'Projeto atualizado com sucesso!' });
        } catch (error) {
            notificationRef.current?.show({
                type: 'error',
                message: 'Erro ao atualizar o projeto. Tente novamente.'
            });
        }
    };

    const handleConfirmDeleteProject = () => {
        setConfirmDeleteVisible(false);
        setEditModalVisible(false);
        
        navigation.goBack();
        
        setTimeout(() => {
            notificationRef.current?.show({ type: 'success', message: 'Projeto excluído com sucesso!' });
        }, 500);
    };

    const handleProceedToMemberSelection = (data: { title: string; description: string; dueDate: Date }) => {
        setNewTaskData(data);
        setNewTaskModalVisible(false);
        setSelectMembersModalVisible(true);
    };

    const handleFinalizeTaskCreation = (selectedMemberIds: number[]) => {
        if (!newTaskData) return;

        const currentUser = MOCK_MEMBERS.find(m => m.projectRole === 'OWNER');
        if (!currentUser) {
            notificationRef.current?.show({ type: 'error', message: 'Usuário criador não encontrado.' });
            return;
        }

        const otherMembers = MOCK_MEMBERS.filter(member => selectedMemberIds.includes(member.userId));
        const assignmentsMap = new Map<number, { userId: number; username: string }>();
        assignmentsMap.set(currentUser.userId, { userId: currentUser.userId, username: currentUser.username });
        otherMembers.forEach(member => {
            assignmentsMap.set(member.userId, { userId: member.userId, username: member.username });
        });

        const finalAssignments = Array.from(assignmentsMap.values());

        const newTask: ProjectTask = {
            id: Date.now(),
            title: newTaskData.title,
            description: newTaskData.description,
            status: 'TO_DO',
            dueDate: newTaskData.dueDate.toISOString(),
            ownerId: currentUser.userId,
            assignments: finalAssignments,
        };

        setTasks(prevTasks => [newTask, ...prevTasks]);
        setSelectMembersModalVisible(false);
        setNewTaskData(null);
        notificationRef.current?.show({ type: 'success', message: 'Tarefa criada com sucesso!' });
    };
    
    const handleCloseSelectMembersModal = () => {
        setSelectMembersModalVisible(false);
        if (newTaskData) {
            handleFinalizeTaskCreation([]);
        }
    };

    const handleInviteByEmail = async (email: string, role: 'ADMIN' | 'MEMBER') => {
        if (!project) return;

        try {
            await projectService.inviteUserByEmail(project.id, { email, role });
            setInviteMemberModalVisible(false);
            notificationRef.current?.show({
                type: 'success',
                message: 'Convite enviado com sucesso!'
            });
            
        } catch (error) {
            const errorMessage = getInviteErrorMessage(error);
            notificationRef.current?.show({
                type: 'error',
                message: errorMessage
            });
        }
    };

    // Exibe loading enquanto carrega os dados do projeto
    if (loadingProject) {
        return (
            <SafeAreaView style={styles.container}>
                <Header userProfile={userWithAvatar} onPressProfile={() => {}} notificationCount={7} onPressNotifications={() => {}} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EB5F1C" />
                    <Text style={styles.loadingText}>Carregando projeto...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header userProfile={userWithAvatar} onPressProfile={() => {}} notificationCount={7} onPressNotifications={() => {}} />

            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <View style={styles.projectHeaderText}>
                    <Text style={styles.titleHeaderText}>Detalhes do Projeto</Text>
                </View>
                <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                    <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
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
                        <Text style={styles.infoTitle}>Membros</Text>
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

            <View style={styles.listWrapper}>
                <FlatList
                    data={sortedTasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ProjectTaskCard 
                            task={item}
                            onPress={() => project && navigation.navigate('TaskDetail', { projectId: project.id, taskId: item.id })}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa encontrada.</Text>}
                />
            </View>
            
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

                        <FlatList
                            data={members}
                            keyExtractor={(item) => item.email}
                            renderItem={({ item }) => (
                                <MemberListItem
                                    name={item.name}
                                    role={item.role}
                                    onPress={() => handleMemberPress(item)}
                                />
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separatorLine} />}
                        />
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
            <EditMemberRoleModal visible={isEditMemberModalVisible} member={selectedMember} currentUserRole={currentUserRole} onClose={() => setEditMemberModalVisible(false)} onSave={handleSaveMemberRole} onDelete={handleDeleteMember} />
            
            <EditProjectModal
                visible={isEditModalVisible}
                project={project}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveProjectDetails}
                onDelete={() => setConfirmDeleteVisible(true)}
            />
            
            <ConfirmationModal
                visible={isConfirmDeleteVisible}
                title="Excluir Projeto"
                message={`Você tem certeza que deseja excluir o projeto "${project?.title}"? Esta ação não pode ser desfeita.`}
                onClose={() => setConfirmDeleteVisible(false)}
                onConfirm={handleConfirmDeleteProject}
                confirmText="Excluir"
            />
            
            <NewTaskModal 
                visible={isNewTaskModalVisible} 
                onClose={() => setNewTaskModalVisible(false)} 
                onNext={handleProceedToMemberSelection} 
            />
            <SelectTaskMembersModal
                visible={isSelectMembersModalVisible}
                onClose={handleCloseSelectMembersModal}
                projectMembers={MOCK_MEMBERS}
                onSave={handleFinalizeTaskCreation}
            />

            <InviteMemberModal
                visible={isInviteMemberModalVisible}
                onClose={() => setInviteMemberModalVisible(false)}
                onInviteByEmail={handleInviteByEmail}
                inviteLink={null}
            />

            <NotificationPopup ref={notificationRef} />
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
    modalView: { width: '90%', maxHeight: '70%', backgroundColor: '#2A2A2A', borderRadius: 20, paddingVertical: 25, paddingHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalCloseButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center', paddingHorizontal: 25 },
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
        marginBottom: 20,
        marginHorizontal: 15,
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { Header } from '../components/Header';
import { ProjectDetails, ProjectMember, ProjectTask } from '../services/projectService';
import { MemberListItem } from '../components/MemberListItem';
import { EditMemberRoleModal, MemberData } from '../components/EditMemberRoleModal';
import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';

import { EditTeamModal } from '../components/EditTeamModal';
import { TeamType } from '../components/TeamCard';

// Tipos para navegação e rotas
type ProjectDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

// --- DADOS MOCADOS PARA TESTE ---
const MOCK_PROJECT_DETAILS: ProjectDetails = {
    id: 1,
    title: 'Projeto TeamTacles',
    description: 'Api de gerenciamento de projetos em equipe, desenvolvida para ser a aplicação final do curso de Análise e Desenvolvimento de Sistemas.',
};

const MOCK_MEMBERS: ProjectMember[] = [
    { userId: 1, username: 'Caio Dib', email: 'caio@email.com', projectRole: 'OWNER' },
    { userId: 2, username: 'Pedro L.', email: 'pedro@email.com', projectRole: 'ADMIN' },
    { userId: 3, username: 'João S.', email: 'joao@email.com', projectRole: 'MEMBER' },
    { userId: 4, username: 'Ana M.', email: 'ana@email.com', projectRole: 'MEMBER' },
];

const MOCK_TASKS: ProjectTask[] = [
    { id: 101, title: 'Protótipo das Telas', description: 'Protótipos de telas no Figma', status: 'IN_PROGRESS', dueDate: '2025-06-26T00:00:00Z', ownerId: 1, assignments: [{ userId: 1, username: 'Caio Dib'}, { userId: 4, username: 'Ana M.'}] },
    { id: 102, title: 'README.md', description: 'Documentação inicial do projeto', status: 'TO_DO', dueDate: '2025-05-28T00:00:00Z', ownerId: 2, assignments: [{ userId: 2, username: 'Pedro L.'}, { userId: 3, username: 'João S.'}] },
    { id: 103, title: 'Configuração do ambiente', description: 'Configurar o ambiente de desenvolvimento', status: 'DONE', dueDate: '2025-05-20T00:00:00Z', ownerId: 1, assignments: [{ userId: 1, username: 'Caio Dib'}, { userId: 2, username: 'Pedro L.'}] },
];

// --- COMPONENTES ---
const TaskCard = ({ task }: { task: ProjectTask }) => {
    const getStatusStyle = (status: ProjectTask['status']) => {
        switch (status) {
            case 'DONE': return { container: styles.statusDone, text: styles.statusTextDone };
            case 'IN_PROGRESS': return { container: styles.statusInProgress, text: styles.statusTextInProgress };
            case 'TO_DO':
            default: return { container: styles.statusToDo, text: styles.statusTextToDo };
        }
    };
    const statusStyle = getStatusStyle(task.status);
    const statusTranslations = { 'DONE': 'Concluído', 'IN_PROGRESS': 'Em andamento', 'TO_DO': 'A fazer' };
    const owner = MOCK_MEMBERS.find(m => m.userId === task.ownerId);

    return (
        <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.statusBadge, statusStyle.container]}>
                    <Text style={statusStyle.text}>{statusTranslations[task.status]}</Text>
                </View>
            </View>
            <Text style={styles.taskDescription}>{task.description}</Text>
            <View style={styles.taskFooter}>
                 <View style={styles.taskFooterInfo}>
                    <View style={styles.taskInfo}>
                        <Icon name="person-outline" size={14} color="#A9A9A9" />
                        <Text style={styles.taskInfoText}>{owner?.username || 'Desconhecido'}</Text>
                    </View>
                    <View style={[styles.taskInfo, { marginLeft: 15 }]}>
                        <Icon name="calendar-outline" size={14} color="#A9A9A9" />
                        <Text style={styles.taskInfoText}>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</Text>
                    </View>
                 </View>
                <View style={styles.taskFooterAvatars}>
                    {task.assignments.map((assignment) => (
                         <View key={assignment.userId} style={styles.avatarSmall}>
                             <Text style={styles.avatarTextSmall}>{assignment.username.substring(0, 2).toUpperCase()}</Text>
                         </View>
                    ))}
                </View>
            </View>
        </View>
    );
};


export const ProjectDetailScreen = () => {
    // AQUI ESTÁ A CORREÇÃO: Apenas uma declaração, com o tipo correto.
    const navigation = useNavigation<ProjectDetailNavigationProp>();
    const notificationRef = useRef<NotificationPopupRef>(null);

    const [project, setProject] = useState<ProjectDetails | null>(MOCK_PROJECT_DETAILS);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isMembersListModalVisible, setMembersListModalVisible] = useState(false);
    const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('OWNER');

    const tasks = MOCK_TASKS;

    const [members, setMembers] = useState<MemberData[]>(
        MOCK_MEMBERS.map(m => ({ name: m.username, email: m.email, role: m.projectRole }))
    );
    
    const userWithAvatar = { initials: 'CD' };

    const handleMemberPress = (member: MemberData) => {
        setMembersListModalVisible(false);
        setTimeout(() => {
            setSelectedMember(member);
            setEditMemberModalVisible(true);
        }, 150);
    };

    const handleSaveMemberRole = (newRole: MemberData['role']) => {
        if (!selectedMember) return;
        setMembers(prev => prev.map(m => m.email === selectedMember.email ? { ...m, role: newRole } : m));
        setEditMemberModalVisible(false);
        notificationRef.current?.show({ type: 'success', message: `Cargo de ${selectedMember.name} atualizado!` });
    };

    const handleDeleteMember = () => {
        if (!selectedMember) return;
        setMembers(prev => prev.filter(m => m.email !== selectedMember.email));
        setEditMemberModalVisible(false);
        notificationRef.current?.show({ type: 'success', message: `${selectedMember.name} foi removido do projeto.` });
    };

    const handleSaveProject = (updatedData: { title: string; description: string }) => {
        setProject(prev => prev ? { ...prev, ...updatedData } : null);
        setEditModalVisible(false);
        notificationRef.current?.show({
            type: 'success',
            message: 'Projeto atualizado com sucesso!',
        });
    };

    const ItemSeparator = () => <View style={styles.separatorLine} />;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={userWithAvatar} onPressProfile={() => {}} notificationCount={7} onPressNotifications={() => {}} />
            
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                </TouchableOpacity>
                <View style={styles.projectHeaderText}>
                    <Text style={styles.projectTitle} numberOfLines={1}>{project?.title}</Text>
                </View>
                <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                    <Icon name="pencil-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.projectDescription}>{project?.description}</Text>

                <View style={styles.infoBar}>
                    <TouchableOpacity 
                        style={styles.infoButton} 
                        onPress={() => project && navigation.navigate('ReportCenter', { projectId: project.id })} 
                    >
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
                    <TouchableOpacity style={styles.orderButton}>
                        <Text style={styles.orderButtonText}>Ordenar por</Text>
                        <Icon name="chevron-down-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.listContainer}>
                    {tasks.length > 0 ? (
                        tasks.map(item => <TouchableOpacity 
                                key={item.id} 
                                onPress={() => project && navigation.navigate('TaskDetail', { projectId: project.id, taskId: item.id })}
                            >
                                <TaskCard task={item} />
                            </TouchableOpacity>)
                    ) : (
                        <Text style={styles.emptyText}>Nenhuma tarefa encontrada.</Text>
                    )}
                </View>
            </ScrollView>
            
            <Modal
                animationType="fade"
                transparent={true}
                visible={isMembersListModalVisible}
                onRequestClose={() => setMembersListModalVisible(false)}
            >
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setMembersListModalVisible(false)}>
                            <Icon name="close-outline" size={30} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Membros do Projeto ({members.length})</Text>
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
                            ItemSeparatorComponent={ItemSeparator} 
                        />
                    </View>
                </View>
            </Modal>

            <EditMemberRoleModal
                visible={isEditMemberModalVisible}
                member={selectedMember}
                currentUserRole={currentUserRole}
                onClose={() => setEditMemberModalVisible(false)}
                onSave={handleSaveMemberRole}
                onDelete={handleDeleteMember}
            />
            
            <EditTeamModal
                visible={isEditModalVisible}
                team={project ? { ...project, id: project.id.toString(), members: [], createdAt: new Date() } as TeamType : null}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveProject}
            />

            <NotificationPopup ref={notificationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    pageHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        marginBottom: 10 
    },
    backButton: { marginRight: 15 },
    projectHeaderText: { flex: 1 },
    projectTitle: { color: '#EB5F1C', fontSize: 24, fontWeight: 'bold' },
    projectDescription: { color: '#ffffffff', fontSize: 14, marginTop: 4, paddingHorizontal: 15, marginBottom: 20, lineHeight: 22 },
    
    infoBar: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginBottom: 25,
        gap: 10,
    },
    infoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderWidth: 2,
        borderColor: '#A9A9A9',
        borderRadius: 15,
    },
    infoTitle: {
        color: '#fff',
        fontSize: 17,
        marginLeft: 8,
    },

    tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
    tasksTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    orderButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3C3C3C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    orderButtonText: { color: '#fff', marginRight: 5 },
    listContainer: { paddingHorizontal: 15, },
    emptyText: { color: '#A9A9A9', textAlign: 'center', marginTop: 50 },
    
    modalCenteredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalView: { width: '90%', maxHeight: '70%', backgroundColor: '#2A2A2A', borderRadius: 20, paddingVertical: 25, paddingHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalCloseButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center', paddingHorizontal: 25 },
    
    separatorLine: {
        height: 1,
        backgroundColor: '#3C3C3C',
        marginHorizontal: 15,
    },

    taskCard: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 15, marginBottom: 15 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    taskTitle: { color: '#EB5F1C', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    statusToDo: { backgroundColor: 'rgba(255, 69, 69, 0.2)' },
    statusTextToDo: { color: '#ff4545', fontWeight: 'bold', fontSize: 10 },
    statusInProgress: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
    statusTextInProgress: { color: '#FFD700', fontWeight: 'bold', fontSize: 10 },
    statusDone: { backgroundColor: 'rgba(60, 179, 113, 0.2)' },
    statusTextDone: { color: '#3CB371', fontWeight: 'bold', fontSize: 10 },
    taskDescription: { color: '#E0E0E0', fontSize: 14, marginBottom: 15 },
    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    taskFooterInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    taskInfo: { flexDirection: 'row', alignItems: 'center' },
    taskInfoText: { color: '#A9A9A9', fontSize: 12, marginLeft: 5 },
    taskFooterAvatars: { flexDirection: 'row-reverse' },
    avatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3C3C3C', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', marginLeft: -8 },
    avatarTextSmall: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
});
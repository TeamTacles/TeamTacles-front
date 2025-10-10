// src/screens/TaskDetailScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { Header } from '../components/Header';
import { FilterPicker } from '../components/FilterPicker';
import { EditTaskModal } from '../components/EditTaskModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AssignTaskMemberModal } from '../components/AssignTaskMemberModal';
import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';
import TimeAgo from '../components/TimeAgo';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TIPOS ---
type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';
interface TaskMember { userId: number; username: string; taskRole: 'OWNER' | 'ASSIGNEE'; }
interface ProjectMember { userId: number; username: string; }
interface TaskDetails {
  id: number; title: string; description: string; status: TaskStatus;
  createdAt: string; dueDate: string; ownerId: number; assignments: TaskMember[];
}
type TaskDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

const MemberRow = ({ member, onRemove }: { member: TaskMember, onRemove: () => void }) => (
    <View style={styles.memberRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{member.username.substring(0, 2).toUpperCase()}</Text></View>
        <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.username}</Text>
            <Text style={styles.memberRole}>{member.taskRole === 'OWNER' ? 'Dono' : 'Responsável'}</Text>
        </View>
        {member.taskRole !== 'OWNER' && (
            <TouchableOpacity onPress={onRemove}><Icon name="trash-outline" size={22} color="#ff4545" /></TouchableOpacity>
        )}
    </View>
);

export const TaskDetailScreen = () => {
    const navigation = useNavigation<TaskDetailNavigationProp>();
    const route = useRoute<TaskDetailRouteProp>();
    const { projectId, taskId } = route.params;
    const notificationRef = useRef<NotificationPopupRef>(null);

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<TaskDetails | null>(null);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isConfirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TaskMember | null>(null);
    const [isAssignmentsExpanded, setAssignmentsExpanded] = useState(true);

    // Array de status COM CORES PARA O BACKGROUND
    const statusItems = [
        { label: 'A Fazer', value: 'TO_DO', color: '#ff4545' },
        { label: 'Em Andamento', value: 'IN_PROGRESS', color: '#FFD700' },
        { label: 'Concluído', value: 'DONE', color: '#2E7D32' },
    ];

    useEffect(() => { /* ... sua lógica para buscar dados da API ... */ 
        // Mock
        const taskData: TaskDetails = { id: taskId, title: 'Revisar protótipo de alta fidelidade', description: 'Verificar todos os fluxos de usuário e garantir que os componentes estão alinhados com o design system.', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), ownerId: 101, assignments: [ { userId: 101, username: 'Gabriela S.', taskRole: 'OWNER' }, { userId: 102, username: 'Caio Dib', taskRole: 'ASSIGNEE' } ] };
        const membersData = { content: [ { userId: 101, username: 'Gabriela S.'}, { userId: 102, username: 'Caio Dib'}, { userId: 103, username: 'Pedro L.'} ] };
        setTask(taskData); setProjectMembers(membersData.content); setLoading(false);
    }, [taskId, projectId]);
    
    const handleUpdateStatus = (newStatus: string | number) => { setTask(prev => prev ? { ...prev, status: newStatus as TaskStatus } : null); notificationRef.current?.show({type: 'success', message: 'Status Atualizado!'}) };
    const handleSaveTaskDetails = (updatedData: { title: string; description: string }) => { setTask(prev => prev ? { ...prev, ...updatedData } : null); setEditModalVisible(false); };
    const handleConfirmRemove = () => { /* ... */ };
    const openRemoveConfirmation = (member: TaskMember) => { setMemberToRemove(member); setConfirmRemoveVisible(true); };
    
    const handleAssignMember = (userId: number) => {
        const memberToAdd = projectMembers.find(m => m.userId === userId);
        if (memberToAdd && task) {
            setTask({ ...task, assignments: [...task.assignments, { ...memberToAdd, taskRole: 'ASSIGNEE' }] });
        }
        setAssignModalVisible(false);
        notificationRef.current?.show({ type: 'success', message: 'Membro adicionado!' });
    };

    const toggleAssignments = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAssignmentsExpanded(!isAssignmentsExpanded);
    };

    if (loading || !task) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#EB5F1C" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={{ initials: 'CD' }} onPressProfile={() => {}} notificationCount={0} onPressNotifications={() => {}} />
            
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back-outline" size={30} color="#EB5F1C" /></TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Detalhes da Tarefa</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(true)}><Icon name="pencil-outline" size={24} color="#FFFFFF" /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.section}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.descriptionText}>{task.description || 'Nenhuma descrição fornecida.'}</Text></View>
                <View style={styles.infoGrid}><View style={styles.infoBox}><Text style={styles.infoLabel}>Criada</Text><Text style={styles.infoValue}><TimeAgo timestamp={new Date(task.createdAt).getTime()} /></Text></View><View style={styles.infoBox}><Text style={styles.infoLabel}>Prazo</Text><Text style={styles.infoValue}>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</Text></View></View>
                <View style={styles.section}><FilterPicker label="Status" items={statusItems} selectedValue={task.status} onValueChange={handleUpdateStatus} /></View>
                
                <View style={styles.section}>
                    <TouchableOpacity onPress={toggleAssignments} style={styles.collapsibleHeader}>
                        <Text style={styles.sectionTitle}>Responsáveis ({task.assignments.length})</Text>
                        <Icon name={isAssignmentsExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#E0E0E0" />
                    </TouchableOpacity>
                    {isAssignmentsExpanded && (
                        <View style={styles.membersContainer}>
                            {task.assignments.map(member => ( <MemberRow key={member.userId} member={member} onRemove={() => openRemoveConfirmation(member)} /> ))}
                            {/* BOTÃO DE ADICIONAR NOVO MEMBRO */}
                            <TouchableOpacity style={styles.addMemberRow} onPress={() => setAssignModalVisible(true)}>
                                <Icon name="add-circle-outline" size={30} color="#EB5F1C" />
                                <Text style={styles.addMemberText}>Adicionar responsável</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            <EditTaskModal visible={isEditModalVisible} task={task} onClose={() => setEditModalVisible(false)} onSave={handleSaveTaskDetails} />
            <AssignTaskMemberModal visible={isAssignModalVisible} onClose={() => setAssignModalVisible(false)} projectMembers={projectMembers} assignedUserIds={task.assignments.map(m => m.userId)} onAssign={handleAssignMember} />
            <ConfirmationModal visible={isConfirmRemoveVisible} title="Remover Membro" message={`Tem certeza que deseja remover ${memberToRemove?.username} desta tarefa?`} onClose={() => setConfirmRemoveVisible(false)} onConfirm={handleConfirmRemove} confirmText="Remover" />
            <NotificationPopup ref={notificationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919', justifyContent: 'center' },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15 },
    backButton: { marginRight: 15 },
    headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', flex: 1 },
    taskTitle: { color: '#EB5F1C', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
    descriptionText: { color: '#ffffffff', fontSize: 16, lineHeight: 24 },
    section: { marginBottom: 25 },
    sectionTitle: { color: '#E0E0E0', fontSize: 16, fontWeight: 'bold' },
    infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    infoBox: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 15, width: '48%' },
    infoLabel: { color: '#A9A9A9', fontSize: 14, marginBottom: 5 },
    infoValue: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    membersContainer: { paddingTop: 5 },
    memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    memberInfo: { flex: 1 },
    memberName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    memberRole: { color: '#A9A9A9', fontSize: 14 },
    // Estilos para o novo botão de adicionar
    addMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingLeft: 4, // Alinha com o avatar
    },
    addMemberText: {
        color: '#EB5F1C',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
});
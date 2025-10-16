// src/screens/TaskDetailScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { RootStackParamList } from '../../../types/navigation';
import { Header } from '../../../components/common/Header';
import { FilterPicker } from '../components/FilterPicker';
import { EditTaskModal } from '../components/EditTaskModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SelectTaskMembersModal } from '../components/SelectTaskMembersModal';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import TimeAgo from '../../../components/TimeAgo';
// --- INÍCIO DA CORREÇÃO ---
// Importe o tipo correto de ProjectMember e remova a definição local
import { ProjectMember } from '../../project/services/projectService';
// --- FIM DA CORREÇÃO ---


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TIPOS ---
type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';
interface TaskMember { userId: number; username: string; taskRole: 'OWNER' | 'ASSIGNEE'; }
// A definição local de ProjectMember foi removida daqui
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
    const [isConfirmDeleteTaskVisible, setConfirmDeleteTaskVisible] = useState(false);
    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TaskMember | null>(null);
    const [isAssignmentsExpanded, setAssignmentsExpanded] = useState(true);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const statusItems = [
        { label: 'A Fazer', value: 'TO_DO', color: '#FFA500' },
        { label: 'Em Andamento', value: 'IN_PROGRESS', color: '#FFD700' },
        { label: 'Concluído', value: 'DONE', color: '#2E7D32' },
    ];

    const isOverdue = task ? new Date(task.dueDate) < new Date() && task.status !== 'DONE' : false;

    useEffect(() => { 
        const taskData: TaskDetails = { id: taskId, title: 'Revisar protótipo de alta fidelidade', description: 'Verificar todos os fluxos de usuário e garantir que os componentes estão alinhados com o design system.', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dueDate: '2020-01-01T00:00:00Z', ownerId: 101, assignments: [ { userId: 101, username: 'Gabriela S.', taskRole: 'OWNER' }, { userId: 102, username: 'Caio Dib', taskRole: 'ASSIGNEE' } ] };
        
        // Mock de membros do projeto com a estrutura correta (adicionando email e projectRole)
        const membersData: { content: ProjectMember[] } = { 
            content: [ 
                { userId: 101, username: 'Gabriela S.', email: 'gabriela@email.com', projectRole: 'OWNER'}, 
                { userId: 102, username: 'Caio Dib', email: 'caio@email.com', projectRole: 'ADMIN' }, 
                { userId: 103, username: 'Pedro L.', email: 'pedro@email.com', projectRole: 'MEMBER' } 
            ] 
        };
        
        setTask(taskData);
        setDate(new Date(taskData.dueDate));
        setProjectMembers(membersData.content); 
        setLoading(false);
    }, [taskId, projectId]);
    
    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (event.type === 'set' && selectedDate) {
            const newDate = selectedDate;
            setDate(newDate);
            if (Platform.OS === 'android') {
                updateTaskDueDate(newDate);
            }
        }
    };

    const confirmIOSDate = () => {
        setShowDatePicker(false);
        updateTaskDueDate(date);
    };

    const updateTaskDueDate = (newDate: Date) => {
        setTask(prev => prev ? { ...prev, dueDate: newDate.toISOString() } : null);
        notificationRef.current?.show({ type: 'success', message: 'Prazo atualizado com sucesso!' });
    };

    const handleUpdateStatus = (newStatus: string | number) => { setTask(prev => prev ? { ...prev, status: newStatus as TaskStatus } : null); notificationRef.current?.show({type: 'success', message: 'Status Atualizado!'}) };
    const handleSaveTaskDetails = (updatedData: { title: string; description: string }) => { setTask(prev => prev ? { ...prev, ...updatedData } : null); setEditModalVisible(false); };
    const handleConfirmRemove = () => { /* ... */ };
    const openRemoveConfirmation = (member: TaskMember) => { setMemberToRemove(member); setConfirmRemoveVisible(true); };
    
    const handleSaveNewAssignments = (selectedMemberIds: number[]) => {
        if (!task || selectedMemberIds.length === 0) {
            setAssignModalVisible(false);
            return;
        }

        const newAssignments = selectedMemberIds.map(id => {
            const member = projectMembers.find(p => p.userId === id);
            return {
                userId: id,
                username: member?.username || 'Desconhecido',
                taskRole: 'ASSIGNEE' as const,
            };
        });

        setTask(prev => prev ? { ...prev, assignments: [...prev.assignments, ...newAssignments] } : null);
        setAssignModalVisible(false);
        notificationRef.current?.show({ type: 'success', message: 'Membros adicionados!' });
    };

    const handleConfirmDeleteTask = () => {
        setConfirmDeleteTaskVisible(false);
        setEditModalVisible(false);
        navigation.goBack();
        setTimeout(() => {
            notificationRef.current?.show({ type: 'success', message: 'Tarefa excluída com sucesso!' });
        }, 500);
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
                
                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}><Text style={styles.infoLabel}>Criada</Text><Text style={styles.infoValue}><TimeAgo timestamp={new Date(task.createdAt).getTime()} /></Text></View>
                    
                    <TouchableOpacity style={styles.infoBox} onPress={() => setShowDatePicker(true)}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.infoLabel}>Prazo</Text>
                            <Text style={styles.editText}>(editar)</Text>
                        </View>
                        <View style={styles.dueDateContainer}>
                            <Text style={[styles.infoValue, isOverdue && styles.overdueText]}>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</Text>
                            {isOverdue && <Icon name="warning" size={16} color="#ff4545" style={styles.editIcon} />}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}><FilterPicker label="Status" items={statusItems} selectedValue={task.status} onValueChange={handleUpdateStatus} /></View>
                
                <View style={styles.section}>
                    <TouchableOpacity onPress={toggleAssignments} style={styles.collapsibleHeader}>
                        <Text style={styles.sectionTitle}>Responsáveis ({task.assignments.length})</Text>
                        <Icon name={isAssignmentsExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#E0E0E0" />
                    </TouchableOpacity>
                    {isAssignmentsExpanded && (
                        <View style={styles.membersContainer}>
                            {task.assignments.map(member => ( <MemberRow key={member.userId} member={member} onRemove={() => openRemoveConfirmation(member)} /> ))}
                            <TouchableOpacity style={styles.addMemberRow} onPress={() => setAssignModalVisible(true)}>
                                <Icon name="add-circle-outline" size={30} color="#EB5F1C" />
                                <Text style={styles.addMemberText}>Adicionar responsável</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        mode="date"
                        display="default"
                        value={date}
                        onChange={handleDateChange}
                    />
                )}
                {showDatePicker && Platform.OS === 'ios' && (
                    <View style={styles.iosPickerButtons}>
                        <TouchableOpacity style={styles.iosPickerButton} onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.iosPickerButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iosPickerButton, styles.iosPickerButtonConfirm]} onPress={confirmIOSDate}>
                            <Text style={styles.iosPickerButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <EditTaskModal 
                visible={isEditModalVisible} 
                task={task} 
                onClose={() => setEditModalVisible(false)} 
                onSave={handleSaveTaskDetails}
                onDelete={() => setConfirmDeleteTaskVisible(true)}
            />
            
            <SelectTaskMembersModal 
                visible={isAssignModalVisible} 
                onClose={() => setAssignModalVisible(false)} 
                projectMembers={projectMembers.filter(pm => !task.assignments.some(a => a.userId === pm.userId))}
                onSave={handleSaveNewAssignments} 
            />
            
            <ConfirmationModal visible={isConfirmRemoveVisible} title="Remover Membro" message={`Tem certeza que deseja remover ${memberToRemove?.username} desta tarefa?`} onClose={() => setConfirmRemoveVisible(false)} onConfirm={handleConfirmRemove} confirmText="Remover" />
            
            <ConfirmationModal 
                visible={isConfirmDeleteTaskVisible} 
                title="Excluir Tarefa" 
                message={`Você tem certeza que deseja excluir a tarefa "${task.title}"?`} 
                onClose={() => setConfirmDeleteTaskVisible(false)} 
                onConfirm={handleConfirmDeleteTask} 
                confirmText="Excluir" 
            />

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
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editText: {
        color: '#A9A9A9',
        fontSize: 12,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    infoValue: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    overdueText: { color: '#ff4545' },
    dueDateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    editIcon: { marginLeft: 8 },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    membersContainer: { paddingTop: 5 },
    memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    memberInfo: { flex: 1 },
    memberName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    memberRole: { color: '#A9A9A9', fontSize: 14 },
    addMemberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingLeft: 4, },
    addMemberText: { color: '#EB5F1C', fontSize: 16, fontWeight: 'bold', marginLeft: 12, },
    iosPickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#3C3C3C',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#555'
    },
    iosPickerButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    iosPickerButtonConfirm: {
        backgroundColor: '#EB5F1C',
        borderRadius: 8,
    },
    iosPickerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
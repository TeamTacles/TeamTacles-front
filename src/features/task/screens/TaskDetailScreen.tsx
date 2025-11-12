import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../types/Navigation';
import { Header } from '../../../components/common/Header';
import { FilterPicker } from '../components/FilterPicker';
import { EditTaskModal } from '../components/EditTaskModal';
import { EditDeadlineModal } from '../components/EditDeadlineModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SelectTaskMembersModal } from '../components/SelectTaskMembersModal';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import TimeAgo from '../../../components/TimeAgo';
import { ProjectMember, projectService } from '../../project/services/projectService';

import { useAppContext } from '../../../contexts/AppContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { taskService, TaskDetailsApiResponse, TaskAssignmentRequest } from '../services/taskService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { getInitialsFromName } from '../../../utils/stringUtils';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
type TaskMember = TaskDetailsApiResponse['assignments'][0];

type TaskDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

const MemberRow = ({ member, onRemove, canRemove }: { member: TaskMember, onRemove: () => void, canRemove: boolean }) => (
    <View style={styles.memberRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{member.username ? member.username.substring(0, 2).toUpperCase() : '?'}</Text></View>
        <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.username || 'Usuário desconhecido'}</Text>
            <Text style={styles.memberRole}>{member.taskRole === 'OWNER' ? 'Dono' : 'Responsável'}</Text>
        </View>
        {member.taskRole !== 'OWNER' && canRemove && (
            <TouchableOpacity onPress={onRemove}><Icon name="trash-outline" size={22} color="#ff4545" /></TouchableOpacity>
        )}
    </View>
);


export const TaskDetailScreen = () => {
    const navigation = useNavigation<TaskDetailNavigationProp>();
    const route = useRoute<TaskDetailRouteProp>();
    const { projectId, taskId, projectRole: projectRoleFromNav, onTaskUpdate, onTaskDelete } = route.params;
    const notificationRef = useRef<NotificationPopupRef>(null);
    const { user } = useAppContext();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<TaskDetailsApiResponse | null>(null);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
    const [projectRole, setProjectRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | undefined>(projectRoleFromNav);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isEditDeadlineModalVisible, setEditDeadlineModalVisible] = useState(false);
    const [isConfirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
    const [isConfirmDeleteTaskVisible, setConfirmDeleteTaskVisible] = useState(false);
    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TaskMember | null>(null);
    const [isAssignmentsExpanded, setAssignmentsExpanded] = useState(true);
    const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);
    const [isLeavingOrDeleting, setIsLeavingOrDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const baseStatusItems = [
        { label: 'A Fazer', value: 'TO_DO', color: '#FFA500' },
        { label: 'Em Andamento', value: 'IN_PROGRESS', color: '#FFD700' },
        { label: 'Concluído', value: 'DONE', color: '#2E7D32' },
    ];

    const getAvailableStatusItems = () => {
        if (!task) return baseStatusItems;
        switch (task.status) {
            case 'TO_DO':
                return baseStatusItems.filter(item => item.value === 'TO_DO' || item.value === 'IN_PROGRESS' || item.value === 'DONE');
            case 'IN_PROGRESS':
                return baseStatusItems.filter(item => item.value === 'IN_PROGRESS' || item.value === 'DONE');
            case 'DONE':
                return baseStatusItems.filter(item => item.value === 'DONE');
            case 'OVERDUE':
                return baseStatusItems.filter(item => item.value === 'IN_PROGRESS' || item.value === 'DONE');
            default:
                return baseStatusItems;
        }
    };

    const isOverdue = task?.status === 'OVERDUE';
    const isTaskOwner = task?.ownerId === user?.id;
    const isAdminOrOwnerOfProject = projectRole === 'ADMIN' || projectRole === 'OWNER';
    const isAssignee = task?.assignments.some(a => a.userId === user?.id && a.taskRole === 'ASSIGNEE');
    const canEditTask = isTaskOwner || isAdminOrOwnerOfProject;
    const canRemoveAssignee = isTaskOwner || isAdminOrOwnerOfProject;
    const canChangeStatus = isTaskOwner || isAdminOrOwnerOfProject || isAssignee;
    const canAddAssignee = canEditTask;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [taskData, membersResponse, projectData] = await Promise.all([
                taskService.getTaskById(projectId, taskId),
                projectService.getProjectMembers(projectId, 0, 100),
                // Busca o role do projeto se não foi passado por navigation
                !projectRoleFromNav ? projectService.getProjectById(projectId) : Promise.resolve(null)
            ]);
            setTask(taskData);
            setProjectMembers(membersResponse.content);

            // Se o role não veio por navigation, usa o role buscado do projeto
            if (!projectRoleFromNav && projectData?.projectRole) {
                setProjectRole(projectData.projectRole);
            }
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: 'Erro ao carregar dados da tarefa.' });
            console.error(error);
             setTimeout(() => navigation.goBack(), 1500);
        } finally {
            setLoading(false);
        }
    }, [projectId, taskId, projectRoleFromNav, navigation]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleSaveDeadline = async (newDate: Date) => {
        if (!task || !canEditTask) return; 
        setIsUpdating(true);
        try {
            // Converte para ISO 8601 UTC 
            const formattedDueDate = newDate.toISOString();
            const updatedTask = await taskService.updateTaskDetails(projectId, taskId, { dueDate: formattedDueDate });
            setTask(updatedTask); 
            setEditDeadlineModalVisible(false); 
            onTaskUpdate?.(taskId, { dueDate: updatedTask.dueDate });
            notificationRef.current?.show({ type: 'success', message: 'Prazo atualizado com sucesso!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
             setIsUpdating(false);
        }
    };


    const handleUpdateStatus = async (newStatusValue: string | number) => {
        const newStatus = newStatusValue as TaskStatus;
        if (!task || task.status === newStatus || !canChangeStatus) return;

        if (newStatus === 'OVERDUE') {
            notificationRef.current?.show({ type: 'error', message: 'O status "Atrasado" é definido automaticamente pelo sistema.' });
            return;
        }

        if (task.status === 'IN_PROGRESS' && newStatus === 'TO_DO') {
            notificationRef.current?.show({ type: 'error', message: 'Não é possível voltar o status de "Em Andamento" para "A Fazer".' });
            return;
        }
        if (task.status === 'DONE') {
             notificationRef.current?.show({ type: 'error', message: 'Não é possível alterar o status de uma tarefa concluída.' });
             return;
        }
        setIsUpdating(true);
        try {
            const updatedTask = await taskService.updateTaskStatus(projectId, taskId, { newStatus: newStatus as 'TO_DO' | 'IN_PROGRESS' | 'DONE' });
            setTask(prev => prev ? { ...prev, status: updatedTask.status, completedAt: updatedTask.completedAt, completionComment: updatedTask.completionComment } : null);
            onTaskUpdate?.(taskId, { status: updatedTask.status });
            notificationRef.current?.show({ type: 'success', message: 'Status Atualizado!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setIsUpdating(false); 
        }
    };

    const handleSaveTaskDetails = async (updatedData: { title: string; description: string }) => {
        if (!task || !canEditTask) return; 
        setIsUpdating(true);
        try {
            const updatedTask = await taskService.updateTaskDetails(projectId, taskId, updatedData);
            setTask(updatedTask);
            setEditModalVisible(false);
            onTaskUpdate?.(taskId, { title: updatedTask.title, description: updatedTask.description });
            notificationRef.current?.show({ type: 'success', message: 'Tarefa atualizada!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmRemove = async () => {
        if (!memberToRemove || !task || !canRemoveAssignee) return; 
        setIsUpdating(true); 
        setConfirmRemoveVisible(false);
        try {
            await taskService.removeAssignees(projectId, taskId, { userIds: [memberToRemove.userId] });
            setTask(prev => prev ? { ...prev, assignments: prev.assignments.filter(a => a.userId !== memberToRemove.userId) } : null);
            notificationRef.current?.show({ type: 'success', message: `${memberToRemove.username} removido.` });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setMemberToRemove(null);
            setIsUpdating(false);
        }
    };

    const openRemoveConfirmation = (member: TaskMember) => {
        if (!canRemoveAssignee) return; 
        setMemberToRemove(member);
        setConfirmRemoveVisible(true);
    };

    const handleSaveNewAssignments = async (selectedMemberIds: number[]) => {
        if (!task || selectedMemberIds.length === 0 || !canAddAssignee) { // Verifica permissão
            setAssignModalVisible(false);
            return;
        }
        setIsUpdating(true); 
        setAssignModalVisible(false);

        const assignmentsPayload: TaskAssignmentRequest[] = selectedMemberIds.map(id => ({
            userId: id,
            taskRole: 'ASSIGNEE', 
        }));

        try {
            const updatedTask = await taskService.assignUsersToTask(projectId, taskId, assignmentsPayload);
            setTask(updatedTask); 
            notificationRef.current?.show({ type: 'success', message: 'Membros adicionados!' });
        } catch (error) {
             notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
             setIsUpdating(false);
        }
    };


    const handleConfirmDeleteTask = async () => {
        if (!task || !canEditTask) return; 
        setIsLeavingOrDeleting(true); 
        setConfirmDeleteTaskVisible(false);
        setEditModalVisible(false); 
        try {
            await taskService.deleteTask(projectId, taskId);
            onTaskDelete?.(taskId);

            showNotification({
                type: 'success',
                message: 'Tarefa excluída com sucesso!'
            });

            navigation.goBack();
        } catch (error) {
            showNotification({
                type: 'error',
                message: getErrorMessage(error)
            });
            setIsLeavingOrDeleting(false); 
        }
    };


    const handleLeaveTask = async () => {
        if (!task) return;

        const isMember = task.assignments.some(a => a.userId === user?.id);
        if (!isMember) {
            showNotification({
                type: 'error',
                message: 'Você não é membro desta tarefa para poder sair.'
            });
            return;
        }

        setIsLeavingOrDeleting(true);
        setConfirmLeaveVisible(false);
        try {
            await taskService.leaveTask(projectId, taskId);

            showNotification({
                type: 'success',
                message: `Você saiu da tarefa "${task.title}"`
            });

            navigation.goBack();
        } catch (error) {
            showNotification({
                type: 'error',
                message: getErrorMessage(error)
            });
            setIsLeavingOrDeleting(false);
        }
    };

    const toggleAssignments = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAssignmentsExpanded(!isAssignmentsExpanded);
    };

    const userProfileForHeader = user ? { initials: getInitialsFromName(user.name) } : { initials: '?' };
    const handleProfilePress = () => navigation.navigate('EditProfile');


    if (loading || !task) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                 <Header
                     userProfile={userProfileForHeader}
                     onPressProfile={handleProfilePress}
                     notificationCount={0}
                     onPressNotifications={() => {}}
                 />
                 <View style={styles.loadingView}>
                     <ActivityIndicator size="large" color="#EB5F1C" />
                 </View>
            </SafeAreaView>
         );
    }


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userProfileForHeader}
                onPressProfile={handleProfilePress}
                notificationCount={0}
                onPressNotifications={() => {}}
            />

            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back-outline" size={30} color="#EB5F1C" /></TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Detalhes da Tarefa</Text>
                 <View style={styles.actionIconsContainer}>
                    {canEditTask && (
                        <TouchableOpacity onPress={() => !isUpdating && setEditModalVisible(true)} style={styles.actionIcon} disabled={isUpdating}>
                            <Icon name="pencil-outline" size={24} color={isUpdating ? "#555" : "#FFFFFF"} />
                        </TouchableOpacity>
                    )}
                    {task.assignments.some(a => a.userId === user?.id) && ( 
                        <TouchableOpacity onPress={() => !isLeavingOrDeleting && setConfirmLeaveVisible(true)} style={styles.actionIcon} disabled={isLeavingOrDeleting || isUpdating}>
                            <Icon name="log-out-outline" size={24} color={isLeavingOrDeleting || isUpdating ? "#888" : "#ff4545"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.section}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.descriptionText}>{task.description || 'Nenhuma descrição fornecida.'}</Text>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Criada</Text>
                        <Text style={styles.infoValue}>
                            <TimeAgo timestamp={new Date(task.createdAt).getTime()} />
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.infoBox}
                        onPress={() => canEditTask && !isUpdating && setEditDeadlineModalVisible(true)}
                        disabled={!canEditTask || isUpdating}
                        activeOpacity={canEditTask ? 0.7 : 1}
                    >
                        <View style={styles.labelContainer}>
                            <Text style={styles.infoLabel}>Prazo</Text>
                            {canEditTask && <Text style={styles.editText}>(editar)</Text>}
                        </View>
                        <Text style={[styles.infoValue, isOverdue && styles.overdueText]}>
                            {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                        <View style={styles.dueDateContainer}>
                            <Text style={[styles.infoTimeValue, isOverdue && styles.overdueText]}>
                                às {new Date(task.dueDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            {isOverdue && <Icon name="warning" size={16} color="#ff4545" style={styles.warningIcon} />}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <FilterPicker
                        label="Status"
                        items={getAvailableStatusItems()}
                        selectedValue={task.status}
                        onValueChange={handleUpdateStatus}
                        style={isUpdating || !canChangeStatus ? styles.pickerDisabled : null}
                    />
                    {!canChangeStatus && <Text style={styles.disabledReasonText}>Você não pode alterar o status.</Text>}
                </View>

                <View style={styles.section}>
                    <TouchableOpacity onPress={toggleAssignments} style={styles.collapsibleHeader}>
                        <Text style={styles.sectionTitle}>Responsáveis ({task.assignments.length})</Text>
                        <Icon name={isAssignmentsExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#E0E0E0" />
                    </TouchableOpacity>
                    {isAssignmentsExpanded && (
                        <View style={styles.membersContainer}>
                            {task.assignments.map(member => (
                                <MemberRow
                                    key={member.userId}
                                    member={member}
                                    onRemove={() => openRemoveConfirmation(member)}
                                    canRemove={canRemoveAssignee}
                                />
                             ))}
                            {canAddAssignee && (
                                <TouchableOpacity
                                    style={styles.addMemberRow}
                                    onPress={() => !isUpdating && setAssignModalVisible(true)} 
                                    disabled={isUpdating} 
                                >
                                    <Icon name="add-circle-outline" size={30} color={isUpdating ? "#555" : "#EB5F1C"} />
                                    <Text style={[styles.addMemberText, isUpdating && styles.addMemberTextDisabled]}>Adicionar responsável</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

            </ScrollView>


             <EditTaskModal
                visible={isEditModalVisible}
                task={task ? { title: task.title, description: task.description || '' } : null}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveTaskDetails}
                onDelete={() => setConfirmDeleteTaskVisible(true)}
                isSaving={isUpdating} 
            />

            <EditDeadlineModal
                visible={isEditDeadlineModalVisible}
                currentDate={task ? new Date(task.dueDate) : new Date()}
                onClose={() => setEditDeadlineModalVisible(false)}
                onSave={handleSaveDeadline}
                isSaving={isUpdating}
                isOverdue={isOverdue}
            />

            <SelectTaskMembersModal
                visible={isAssignModalVisible}
                onClose={() => setAssignModalVisible(false)}
                projectMembers={projectMembers.filter(pm => !task.assignments.some(a => a.userId === pm.userId))}
                onSave={handleSaveNewAssignments}
                isSaving={isUpdating} 
            />

            <ConfirmationModal
                visible={isConfirmRemoveVisible}
                title="Remover Membro"
                message={`Tem certeza que deseja remover ${memberToRemove?.username} desta tarefa?`}
                onClose={() => setConfirmRemoveVisible(false)}
                onConfirm={handleConfirmRemove}
                confirmText="Remover"
                isConfirming={isUpdating}
                confirmingText="Removendo..."
                disableClose={isUpdating} 
            />

             <ConfirmationModal
                visible={isConfirmDeleteTaskVisible}
                title="Excluir Tarefa"
                message={`Você tem certeza que deseja excluir a tarefa "${task.title}"?`}
                onClose={() => setConfirmDeleteTaskVisible(false)}
                onConfirm={handleConfirmDeleteTask}
                confirmText="Excluir"
                isConfirming={isLeavingOrDeleting} 
                confirmingText="Excluindo..."
                disableClose={isLeavingOrDeleting} 
            />

            <ConfirmationModal
                visible={isConfirmLeaveVisible}
                title="Sair da Tarefa"
                message={`Tem certeza que deseja sair da tarefa "${task.title}"?`}
                onClose={() => setConfirmLeaveVisible(false)}
                onConfirm={handleLeaveTask}
                confirmText="Sair"
                isConfirming={isLeavingOrDeleting} 
                confirmingText="Saindo..."
                disableClose={isLeavingOrDeleting} 
            />

            <NotificationPopup ref={notificationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    pickerDisabled: {
        opacity: 0.5, 
    },
    disabledReasonText: {
        fontSize: 12,
        color: '#A9A9A9',
        marginTop: -10, 
        marginBottom: 15,
        marginLeft: 5,
    },
    container: { flex: 1, backgroundColor: '#191919' },
    loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15 },
    backButton: { marginRight: 15 },
    headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10 },
    actionIconsContainer: { flexDirection: 'row', alignItems: 'center' },
    actionIcon: { marginLeft: 15 },
    taskTitle: { color: '#EB5F1C', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
    descriptionText: { color: '#ffffffff', fontSize: 16, lineHeight: 24 },
    section: { marginBottom: 25 },
    sectionTitle: { color: '#E0E0E0', fontSize: 16, fontWeight: 'bold' },
    infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    infoBox: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 15, width: '48%' },
    infoLabel: { color: '#A9A9A9', fontSize: 14, marginBottom: 5 },
    labelContainer: { flexDirection: 'row', alignItems: 'center' },
    editText: { color: '#A9A9A9', fontSize: 12, marginLeft: 4, fontStyle: 'italic' },
    infoValue: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    infoTimeValue: { color: '#A9A9A9', fontSize: 14, marginTop: 4 },
    overdueText: { color: '#ff4545' },
    dueDateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    warningIcon: { marginLeft: 8 },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    membersContainer: { paddingTop: 5 },
    memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    memberInfo: { flex: 1 },
    memberName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    memberRole: { color: '#A9A9A9', fontSize: 14 },
    addMemberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingLeft: 4, opacity: 1 },
    addMemberText: { color: '#EB5F1C', fontSize: 16, fontWeight: 'bold', marginLeft: 12, },
    addMemberTextDisabled: { color: '#555'},
});
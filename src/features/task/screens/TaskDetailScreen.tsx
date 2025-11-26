import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { RootStackParamList } from '../../../types/Navigation';
import { Header } from '../../../components/common/Header';
import { FilterPicker } from '../components/FilterPicker';
import { EditTaskModal } from '../components/EditTaskModal';
import { EditDeadlineModal } from '../components/EditDeadlineModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SelectTaskMembersModal } from '../components/SelectTaskMembersModal';
import { TaskCompletionModal } from '../components/TaskCompletionModal';

import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import TimeAgo from '../../../components/TimeAgo';
import { projectService } from '../../project/services/projectService';
import { useProjectMembers } from '../../project/hooks/useProjectMembers';

import { useAppContext } from '../../../contexts/AppContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { taskService, TaskDetailsApiResponse, TaskAssignmentRequest } from '../services/taskService';
import { getErrorMessage } from '../../../utils/errorHandler';
import { getInitialsFromName } from '../../../utils/stringUtils';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
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
    const { projectId, taskId, projectRole: projectRoleFromNav } = route.params;

    const notificationRef = useRef<NotificationPopupRef>(null);
    const { user } = useAppContext();
    const { showNotification } = useNotification();
    const queryClient = useQueryClient();

    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isEditDeadlineModalVisible, setEditDeadlineModalVisible] = useState(false);
    const [isConfirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
    const [isConfirmDeleteTaskVisible, setConfirmDeleteTaskVisible] = useState(false);
    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [isConfirmLeaveVisible, setConfirmLeaveVisible] = useState(false);

    const [isConfirmCompleteVisible, setConfirmCompleteVisible] = useState(false); 
    const [isCommentModalVisible, setCommentModalVisible] = useState(false); 

    const [memberToRemove, setMemberToRemove] = useState<TaskMember | null>(null);
    const [isAssignmentsExpanded, setAssignmentsExpanded] = useState(true);

    const [isLeavingOrDeleting, setIsLeavingOrDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const { data: task, isLoading: loadingTask } = useQuery({
        queryKey: ['task', taskId],
        queryFn: async () => {
            try {
                return await taskService.getTaskById(projectId, taskId);
            } catch (error) {
                showNotification({ type: 'error', message: 'Erro ao carregar tarefa.' });
                navigation.goBack();
                throw error;
            }
        },
        staleTime: 1000 * 10 * 5,
    });

    const { data: projectData } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProjectById(projectId),
        enabled: !projectRoleFromNav,
        staleTime: 1000 * 60 * 10,
    });

    const { members: projectMembers, initialLoading: loadingMembers } = useProjectMembers(projectId);

    const projectRole = projectRoleFromNav || projectData?.projectRole;

    const baseStatusItems = [
        { label: 'A Fazer', value: 'TO_DO', color: '#FFA500' },
        { label: 'Em Andamento', value: 'IN_PROGRESS', color: '#FFD700' },
        { label: 'Concluído', value: 'DONE', color: '#2E7D32' },
    ];

    const getAvailableStatusItems = () => {
        if (!task) return baseStatusItems;
        
        const effectiveStatus = task.status === 'OVERDUE' ? task.originalStatus : task.status;

        switch (effectiveStatus) {
            case 'TO_DO':
                return baseStatusItems.filter(item => item.value === 'TO_DO' || item.value === 'IN_PROGRESS' || item.value === 'DONE');
            
            case 'IN_PROGRESS':
                return baseStatusItems.filter(item => item.value === 'TO_DO' || item.value === 'IN_PROGRESS' || item.value === 'DONE');

            case 'DONE':
                return baseStatusItems.filter(item => item.value === 'DONE');

            default:
                return baseStatusItems;
        }
    };

    const isOverdue = task?.status === 'OVERDUE';
    const overdueStatusDisplay = isOverdue
        ? baseStatusItems.find(item => item.value === task?.originalStatus)
        : undefined;

    const isTaskOwner = task?.ownerId === user?.id;
    const isAdminOrOwnerOfProject = projectRole === 'ADMIN' || projectRole === 'OWNER';
    const isAssignee = task?.assignments.some(a => a.userId === user?.id && a.taskRole === 'ASSIGNEE');

    const canEditTask = isTaskOwner || isAdminOrOwnerOfProject;
    const canRemoveAssignee = isTaskOwner || isAdminOrOwnerOfProject;
    const canChangeStatus = isTaskOwner || isAdminOrOwnerOfProject || isAssignee;
    const canAddAssignee = canEditTask;

    const updateLocalCache = (updater: (oldTask: TaskDetailsApiResponse) => TaskDetailsApiResponse) => {
        queryClient.setQueryData(['task', taskId], (old: TaskDetailsApiResponse | undefined) => {
            return old ? updater(old) : old;
        });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
    };

    const handleSaveDeadline = async (newDate: Date) => {
        if (!task || !canEditTask) return;
        setIsUpdating(true);
        try {
            const formattedDueDate = newDate.toISOString();
            const updatedTask = await taskService.updateTaskDetails(projectId, taskId, { dueDate: formattedDueDate });

            updateLocalCache((old) => ({
                ...old,
                dueDate: updatedTask.dueDate,
                status: updatedTask.status,
                originalStatus: updatedTask.originalStatus
            }));
            setEditDeadlineModalVisible(false);

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
            notificationRef.current?.show({ type: 'error', message: 'Status "Atrasado" é automático.' });
            return;
        }

        if (newStatus === 'DONE') {
            setConfirmCompleteVisible(true);
            return;
        }

        setIsUpdating(true);
        try {
            const updatedTask = await taskService.updateTaskStatus(projectId, taskId, { newStatus: newStatus as any });

            updateLocalCache((old) => ({
                ...old,
                status: updatedTask.status,
                
                originalStatus: updatedTask.originalStatus ?? old.originalStatus, 
                
                completedAt: updatedTask.completedAt,
                completionComment: updatedTask.completionComment
            }));

            notificationRef.current?.show({ type: 'success', message: 'Status Atualizado!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleProceedToCompletion = () => {
        setConfirmCompleteVisible(false);
        setTimeout(() => {
            setCommentModalVisible(true);
        }, 300); 
    };

    const handleFinalizeTask = async (comment: string) => {
        if (!task) return;
        setIsUpdating(true);
        try {
            const updatedTask = await taskService.updateTaskStatus(projectId, taskId, {
                newStatus: 'DONE',
                completionComment: comment
            });

            updateLocalCache((old) => ({
                ...old,
                status: updatedTask.status,
                originalStatus: updatedTask.status,
                completedAt: updatedTask.completedAt,
                completionComment: updatedTask.completionComment
            }));

            setCommentModalVisible(false);
            notificationRef.current?.show({ type: 'success', message: 'Tarefa concluída com sucesso!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveTaskDetails = async (updatedData: any) => { 
        if (!task || !canEditTask) return;
        setIsUpdating(true);
        try {
            const updatedTask = await taskService.updateTaskDetails(projectId, taskId, updatedData);
            updateLocalCache((old) => ({ ...old, title: updatedTask.title, description: updatedTask.description }));
            setEditModalVisible(false);
            notificationRef.current?.show({ type: 'success', message: 'Tarefa atualizada!' });
        } catch (error) { notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) }); } finally { setIsUpdating(false); }
    };

    const handleConfirmRemove = async () => { 
        if (!memberToRemove || !task || !canRemoveAssignee) return;
        setIsUpdating(true); setConfirmRemoveVisible(false);
        try {
            await taskService.removeAssignees(projectId, taskId, { userIds: [memberToRemove.userId] });
            updateLocalCache((old) => ({ ...old, assignments: old.assignments.filter(a => a.userId !== memberToRemove.userId) }));
            notificationRef.current?.show({ type: 'success', message: `${memberToRemove.username} removido.` });
        } catch (error) { notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) }); } finally { setMemberToRemove(null); setIsUpdating(false); }
    };

    const handleSaveNewAssignments = async (selectedMemberIds: number[]) => { 
        if (!task || selectedMemberIds.length === 0 || !canAddAssignee) { setAssignModalVisible(false); return; }
        setIsUpdating(true); setAssignModalVisible(false);
        const assignmentsPayload: TaskAssignmentRequest[] = selectedMemberIds.map(id => ({ userId: id, taskRole: 'ASSIGNEE' }));
        try {
            const updatedTask = await taskService.assignUsersToTask(projectId, taskId, assignmentsPayload);
            updateLocalCache((old) => updatedTask);
            notificationRef.current?.show({ type: 'success', message: 'Membros adicionados!' });
        } catch (error) { notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) }); } finally { setIsUpdating(false); }
    };

    const handleConfirmDeleteTask = async () => { 
        if (!task || !canEditTask) return; setIsLeavingOrDeleting(true); setConfirmDeleteTaskVisible(false); setEditModalVisible(false);
        try {
            await taskService.deleteTask(projectId, taskId); queryClient.removeQueries({ queryKey: ['task', taskId] }); queryClient.invalidateQueries({ queryKey: ['tasks'] }); queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
            showNotification({ type: 'success', message: 'Tarefa excluída com sucesso!' }); navigation.goBack();
        } catch (error) { showNotification({ type: 'error', message: getErrorMessage(error) }); setIsLeavingOrDeleting(false); }
    };

    const handleLeaveTask = async () => { 
        if (!task) return; setIsLeavingOrDeleting(true); setConfirmLeaveVisible(false);
        try {
            await taskService.leaveTask(projectId, taskId); queryClient.invalidateQueries({ queryKey: ['tasks'] }); queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
            showNotification({ type: 'success', message: `Você saiu da tarefa` }); navigation.goBack();
        } catch (error) { showNotification({ type: 'error', message: getErrorMessage(error) }); setIsLeavingOrDeleting(false); }
    };

    const openRemoveConfirmation = (member: TaskMember) => { if (!canRemoveAssignee) return; setMemberToRemove(member); setConfirmRemoveVisible(true); };
    const toggleAssignments = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAssignmentsExpanded(!isAssignmentsExpanded); };
    const userProfileForHeader = user ? { initials: getInitialsFromName(user.name) } : { initials: '?' };
    const handleProfilePress = () => navigation.navigate('EditProfile');

    if (loadingTask || !task) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <Header userProfile={userProfileForHeader} onPressProfile={handleProfilePress} notificationCount={0} onPressNotifications={() => { }} />
                <View style={styles.loadingView}><ActivityIndicator size="large" color="#EB5F1C" /></View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={userProfileForHeader} onPressProfile={handleProfilePress} notificationCount={0} onPressNotifications={() => { }} />

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
                        <Text style={styles.infoValue}><TimeAgo timestamp={new Date(task.createdAt).getTime()} /></Text>
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
                        selectedValue={task.status === 'OVERDUE' ? (task.originalStatus ?? null) : task.status}                        
                        onValueChange={handleUpdateStatus}
                        style={isUpdating || !canChangeStatus ? styles.pickerDisabled : null}
                        selectedLabelOverride={overdueStatusDisplay?.label}
                        selectedColorOverride={overdueStatusDisplay?.color}
                    />
                    {!canChangeStatus && <Text style={styles.disabledReasonText}>Você não pode alterar o status.</Text>}

                    {task.status === 'DONE' && (
                        <View style={styles.completionContainer}>
                            <View style={styles.completionHeader}>
                                <Icon name="checkmark-done-circle" size={24} color="#3CB371" />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.completionTitle}>Tarefa Finalizada!</Text>
                                    {task.completedAt && (
                                        <Text style={styles.completionTime}>
                                            Em {new Date(task.completedAt).toLocaleDateString('pt-BR')} às {new Date(task.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {task.completionComment && (
                                <>
                                    <View style={styles.dividerGreen} />
                                    <Text style={styles.completionLabel}>Observação:</Text>
                                    <Text style={styles.completionText}>{task.completionComment}</Text>
                                </>
                            )}
                        </View>
                    )}
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
                projectMembers={projectMembers.filter(pm => !(task?.assignments ?? []).some(a => a.userId === pm.userId))}
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
                visible={isConfirmCompleteVisible}
                title="Concluir Tarefa?"
                message={"Atenção: Após concluir a tarefa, não será possível alterar o status novamente.\n\nDeseja prosseguir?"}                onClose={() => setConfirmCompleteVisible(false)}
                onConfirm={handleProceedToCompletion}
                confirmText="Prosseguir"
                isConfirming={false}
            />

            <TaskCompletionModal
                visible={isCommentModalVisible}
                onClose={() => setCommentModalVisible(false)}
                onConfirm={handleFinalizeTask}
                isSaving={isUpdating}
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
    completionContainer: {
        backgroundColor: 'rgba(60, 179, 113, 0.15)', 
        padding: 15,
        borderRadius: 12,
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'rgba(60, 179, 113, 0.3)',
    },
    completionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    completionTitle: {
        color: '#3CB371',
        fontWeight: 'bold',
        fontSize: 16,
    },
    completionTime: {
        color: '#A9A9A9',
        fontSize: 12,
        marginTop: 2,
    },
    dividerGreen: {
        height: 1,
        backgroundColor: 'rgba(60, 179, 113, 0.3)',
        marginVertical: 10,
    },
    completionLabel: {
        color: '#E0E0E0', 
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    completionText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 22,
        fontStyle: 'italic',
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
    addMemberTextDisabled: { color: '#555' },
});
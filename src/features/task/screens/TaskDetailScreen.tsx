// src/features/task/screens/TaskDetailScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../types/navigation';
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

// --- TIPOS ---
type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
type TaskMember = TaskDetailsApiResponse['assignments'][0];

type TaskDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

// Componente MemberRow
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
    // --- INÍCIO DA ALTERAÇÃO: Obter projectRole dos parâmetros da rota ---
    // Precisamos saber a role do usuário NO PROJETO para as permissões
    const { projectId, taskId, projectRole, onTaskUpdate, onTaskDelete } = route.params;
    // --- FIM DA ALTERAÇÃO ---
    const notificationRef = useRef<NotificationPopupRef>(null);
    const { user } = useAppContext();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<TaskDetailsApiResponse | null>(null);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
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
                // Tarefa atrasada pode ser movida para Em Andamento ou Concluído
                return baseStatusItems.filter(item => item.value === 'IN_PROGRESS' || item.value === 'DONE');
            default:
                return baseStatusItems;
        }
    };

    // --- INÍCIO DA ALTERAÇÃO: Lógica de Permissão ---
    const isOverdue = task?.status === 'OVERDUE';
    const isTaskOwner = task?.ownerId === user?.id;
    // Verifica se o usuário tem role privilegiada no PROJETO
    const isAdminOrOwnerOfProject = projectRole === 'ADMIN' || projectRole === 'OWNER';
    // Verifica se o usuário é um responsável (assignee) pela TAREFA
    const isAssignee = task?.assignments.some(a => a.userId === user?.id && a.taskRole === 'ASSIGNEE');

    // Pode editar/deletar a tarefa se for dono da TAREFA ou admin/dono do PROJETO
    const canEditTask = isTaskOwner || isAdminOrOwnerOfProject;
    // Pode remover responsável se for dono da TAREFA ou admin/dono do PROJETO
    const canRemoveAssignee = isTaskOwner || isAdminOrOwnerOfProject;
    // Pode mudar status se for dono da TAREFA ou admin/dono do PROJETO ou responsável pela TAREFA
    const canChangeStatus = isTaskOwner || isAdminOrOwnerOfProject || isAssignee;
    // Pode adicionar responsável se puder editar a tarefa
    const canAddAssignee = canEditTask;
    // --- FIM DA ALTERAÇÃO ---


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [taskData, membersResponse] = await Promise.all([
                taskService.getTaskById(projectId, taskId),
                projectService.getProjectMembers(projectId, 0, 100) // Busca mais membros para o modal
            ]);
            setTask(taskData);
            setProjectMembers(membersResponse.content);
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: 'Erro ao carregar dados da tarefa.' });
            console.error(error);
             setTimeout(() => navigation.goBack(), 1500);
        } finally {
            setLoading(false);
        }
    }, [projectId, taskId, navigation]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleSaveDeadline = async (newDate: Date) => {
        if (!task || !canEditTask) return; // Verifica permissão
        setIsUpdating(true);
        try {
            // Converte para ISO 8601 UTC (formato padrão: "YYYY-MM-DDTHH:mm:ss.sssZ")
            const formattedDueDate = newDate.toISOString();
            const updatedTask = await taskService.updateTaskDetails(projectId, taskId, { dueDate: formattedDueDate });
            setTask(updatedTask); // Atualiza estado com resposta da API
            setEditDeadlineModalVisible(false); // Fecha o modal
            // Atualiza a lista do projeto instantaneamente
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
        // --- INÍCIO DA ALTERAÇÃO: Adicionar verificação de permissão ---
        if (!task || task.status === newStatus || !canChangeStatus) return;
        // --- FIM DA ALTERAÇÃO ---

        // Validação: usuário não pode definir status como OVERDUE manualmente
        if (newStatus === 'OVERDUE') {
            notificationRef.current?.show({ type: 'error', message: 'O status "Atrasado" é definido automaticamente pelo sistema.' });
            return;
        }

        // Manter as validações de transição
        if (task.status === 'IN_PROGRESS' && newStatus === 'TO_DO') {
            notificationRef.current?.show({ type: 'error', message: 'Não é possível voltar o status de "Em Andamento" para "A Fazer".' });
            return;
        }
        if (task.status === 'DONE') {
             notificationRef.current?.show({ type: 'error', message: 'Não é possível alterar o status de uma tarefa concluída.' });
             return;
        }
        setIsUpdating(true); // Ativa loading específico para status
        try {
            const updatedTask = await taskService.updateTaskStatus(projectId, taskId, { newStatus: newStatus as 'TO_DO' | 'IN_PROGRESS' | 'DONE' });
            // Atualiza o estado local da tarefa com a resposta da API
            setTask(prev => prev ? { ...prev, status: updatedTask.status, completedAt: updatedTask.completedAt, completionComment: updatedTask.completionComment } : null);
            // Atualiza a lista do projeto instantaneamente
            onTaskUpdate?.(taskId, { status: updatedTask.status });
            notificationRef.current?.show({ type: 'success', message: 'Status Atualizado!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
            // Não precisa reverter o picker aqui, pois ele é controlado pelo estado `task.status`
        } finally {
            setIsUpdating(false); // Desativa loading
        }
    };

    const handleSaveTaskDetails = async (updatedData: { title: string; description: string }) => {
        if (!task || !canEditTask) return; // Verifica permissão
        setIsUpdating(true); // Reutiliza o estado de loading
        try {
            const updatedTask = await taskService.updateTaskDetails(projectId, taskId, updatedData);
            setTask(updatedTask);
            setEditModalVisible(false);
            // Atualiza a lista do projeto instantaneamente
            onTaskUpdate?.(taskId, { title: updatedTask.title, description: updatedTask.description });
            notificationRef.current?.show({ type: 'success', message: 'Tarefa atualizada!' });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmRemove = async () => {
        if (!memberToRemove || !task || !canRemoveAssignee) return; // Verifica permissão
        setIsUpdating(true); // Reutiliza o estado de loading
        setConfirmRemoveVisible(false);
        try {
            await taskService.removeAssignees(projectId, taskId, { userIds: [memberToRemove.userId] });
            // Atualiza o estado local da tarefa removendo o membro
            setTask(prev => prev ? { ...prev, assignments: prev.assignments.filter(a => a.userId !== memberToRemove.userId) } : null);
            notificationRef.current?.show({ type: 'success', message: `${memberToRemove.username} removido.` });
        } catch (error) {
            notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setMemberToRemove(null);
            setIsUpdating(false);
        }
    };

    // Abre modal de confirmação para remover membro
    const openRemoveConfirmation = (member: TaskMember) => {
        if (!canRemoveAssignee) return; // Não abre se não tiver permissão
        setMemberToRemove(member);
        setConfirmRemoveVisible(true);
    };

    // Salva novas atribuições
    const handleSaveNewAssignments = async (selectedMemberIds: number[]) => {
        if (!task || selectedMemberIds.length === 0 || !canAddAssignee) { // Verifica permissão
            setAssignModalVisible(false);
            return;
        }
        setIsUpdating(true); // Reutiliza estado de loading
        setAssignModalVisible(false);

        const assignmentsPayload: TaskAssignmentRequest[] = selectedMemberIds.map(id => ({
            userId: id,
            taskRole: 'ASSIGNEE', // Só pode adicionar como ASSIGNEE
        }));

        try {
            const updatedTask = await taskService.assignUsersToTask(projectId, taskId, assignmentsPayload);
            setTask(updatedTask); // Atualiza o estado com a resposta da API (incluindo novos membros)
            notificationRef.current?.show({ type: 'success', message: 'Membros adicionados!' });
        } catch (error) {
             notificationRef.current?.show({ type: 'error', message: getErrorMessage(error) });
        } finally {
             setIsUpdating(false);
        }
    };


    const handleConfirmDeleteTask = async () => {
        if (!task || !canEditTask) return; // Verifica permissão
        setIsLeavingOrDeleting(true); // Usa estado específico para delete/leave
        setConfirmDeleteTaskVisible(false);
        setEditModalVisible(false); // Fecha modal de edição se estiver aberto
        try {
            await taskService.deleteTask(projectId, taskId);
            // Remove a task da lista do projeto instantaneamente
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
            setIsLeavingOrDeleting(false); // Libera o loading em caso de erro
        }
    };


    const handleLeaveTask = async () => {
        if (!task) return;

        // Validação: verifica se o usuário é realmente um membro (defesa em profundidade)
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

    // Animação para expandir/recolher
    const toggleAssignments = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAssignmentsExpanded(!isAssignmentsExpanded);
    };

    // Perfil para o Header
    const userProfileForHeader = user ? { initials: getInitialsFromName(user.name) } : { initials: '?' };
    const handleProfilePress = () => navigation.navigate('EditProfile');


    // Loading inicial
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


    // Renderização principal
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <Header
                userProfile={userProfileForHeader}
                onPressProfile={handleProfilePress}
                notificationCount={0}
                onPressNotifications={() => {}}
            />

            {/* Cabeçalho da Página */}
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back-outline" size={30} color="#EB5F1C" /></TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Detalhes da Tarefa</Text>
                 <View style={styles.actionIconsContainer}>
                    {/* Botão Editar Tarefa (controlado por canEditTask) */}
                    {canEditTask && (
                        <TouchableOpacity onPress={() => !isUpdating && setEditModalVisible(true)} style={styles.actionIcon} disabled={isUpdating}>
                            <Icon name="pencil-outline" size={24} color={isUpdating ? "#555" : "#FFFFFF"} />
                        </TouchableOpacity>
                    )}
                    {/* Botão Sair da Tarefa (visível se for membro, desabilitado durante ações) */}
                    {task.assignments.some(a => a.userId === user?.id) && ( // Só mostra se for membro
                        <TouchableOpacity onPress={() => !isLeavingOrDeleting && setConfirmLeaveVisible(true)} style={styles.actionIcon} disabled={isLeavingOrDeleting || isUpdating}>
                            <Icon name="log-out-outline" size={24} color={isLeavingOrDeleting || isUpdating ? "#888" : "#ff4545"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Conteúdo Scrollable */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Detalhes da Tarefa */}
                <View style={styles.section}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.descriptionText}>{task.description || 'Nenhuma descrição fornecida.'}</Text>
                </View>

                {/* Grid de Informações */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Criada</Text>
                        <Text style={styles.infoValue}>
                            {/* Usa TimeAgo para data de criação */}
                            <TimeAgo timestamp={new Date(task.createdAt).getTime()} />
                        </Text>
                    </View>

                    {/* Caixa de Prazo (Clicável se tiver permissão) */}
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

                {/* Seção Status (Editável se tiver permissão) */}
                <View style={styles.section}>
                    <FilterPicker
                        label="Status"
                        items={getAvailableStatusItems()}
                        selectedValue={task.status}
                        onValueChange={handleUpdateStatus}
                        // Desabilita o picker se estiver atualizando ou sem permissão
                        style={isUpdating || !canChangeStatus ? styles.pickerDisabled : null}
                    />
                     {/* Mostra mensagem se o picker estiver desabilitado */}
                    {!canChangeStatus && <Text style={styles.disabledReasonText}>Você não pode alterar o status.</Text>}
                </View>

                {/* Seção Responsáveis (Colapsável) */}
                <View style={styles.section}>
                    <TouchableOpacity onPress={toggleAssignments} style={styles.collapsibleHeader}>
                        <Text style={styles.sectionTitle}>Responsáveis ({task.assignments.length})</Text>
                        <Icon name={isAssignmentsExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#E0E0E0" />
                    </TouchableOpacity>
                    {isAssignmentsExpanded && (
                        <View style={styles.membersContainer}>
                            {/* Lista de Membros */}
                            {task.assignments.map(member => (
                                <MemberRow
                                    key={member.userId}
                                    member={member}
                                    onRemove={() => openRemoveConfirmation(member)}
                                    // Habilita remoção baseado em canRemoveAssignee
                                    canRemove={canRemoveAssignee}
                                />
                             ))}
                            {/* Botão Adicionar Responsável (Controlado por canAddAssignee) */}
                            {canAddAssignee && (
                                <TouchableOpacity
                                    style={styles.addMemberRow}
                                    onPress={() => !isUpdating && setAssignModalVisible(true)} // Abre modal de atribuição
                                    disabled={isUpdating} // Desabilita se atualizando
                                >
                                    <Icon name="add-circle-outline" size={30} color={isUpdating ? "#555" : "#EB5F1C"} />
                                    <Text style={[styles.addMemberText, isUpdating && styles.addMemberTextDisabled]}>Adicionar responsável</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* --- MODAIS --- */}

            {/* Modal Editar Tarefa (controlado por canEditTask indiretamente) */}
             <EditTaskModal
                visible={isEditModalVisible}
                task={task ? { title: task.title, description: task.description || '' } : null}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveTaskDetails}
                // Passa a função para abrir o modal de confirmação de exclusão
                onDelete={() => setConfirmDeleteTaskVisible(true)}
                isSaving={isUpdating} // Passa estado de loading
            />

            {/* Modal Editar Prazo (Data/Hora) */}
            <EditDeadlineModal
                visible={isEditDeadlineModalVisible}
                currentDate={task ? new Date(task.dueDate) : new Date()}
                onClose={() => setEditDeadlineModalVisible(false)}
                onSave={handleSaveDeadline}
                isSaving={isUpdating}
                isOverdue={isOverdue}
            />

            {/* Modal Selecionar Membros (controlado por canAddAssignee indiretamente) */}
            <SelectTaskMembersModal
                visible={isAssignModalVisible}
                onClose={() => setAssignModalVisible(false)}
                // Filtra membros do projeto que ainda não estão na tarefa
                projectMembers={projectMembers.filter(pm => !task.assignments.some(a => a.userId === pm.userId))}
                onSave={handleSaveNewAssignments}
                isSaving={isUpdating} // Passa estado de loading
            />

            {/* Modal Confirmação Remover Membro (controlado por canRemoveAssignee indiretamente) */}
            <ConfirmationModal
                visible={isConfirmRemoveVisible}
                title="Remover Membro"
                message={`Tem certeza que deseja remover ${memberToRemove?.username} desta tarefa?`}
                onClose={() => setConfirmRemoveVisible(false)}
                onConfirm={handleConfirmRemove}
                confirmText="Remover"
                isConfirming={isUpdating} // Passa estado de loading
                confirmingText="Removendo..."
                disableClose={isUpdating} // Desabilita fechar durante a ação
            />

             {/* Modal Confirmação Deletar Tarefa (controlado por canEditTask indiretamente) */}
             <ConfirmationModal
                visible={isConfirmDeleteTaskVisible}
                title="Excluir Tarefa"
                message={`Você tem certeza que deseja excluir a tarefa "${task.title}"?`}
                onClose={() => setConfirmDeleteTaskVisible(false)}
                onConfirm={handleConfirmDeleteTask}
                confirmText="Excluir"
                isConfirming={isLeavingOrDeleting} // Usa estado específico
                confirmingText="Excluindo..."
                disableClose={isLeavingOrDeleting} // Desabilita fechar
            />

            {/* Modal Confirmação Sair da Tarefa */}
            <ConfirmationModal
                visible={isConfirmLeaveVisible}
                title="Sair da Tarefa"
                message={`Tem certeza que deseja sair da tarefa "${task.title}"?`}
                onClose={() => setConfirmLeaveVisible(false)}
                onConfirm={handleLeaveTask}
                confirmText="Sair"
                isConfirming={isLeavingOrDeleting} // Usa estado específico
                confirmingText="Saindo..."
                disableClose={isLeavingOrDeleting} // Desabilita fechar
            />

            {/* Popup de Notificação */}
            <NotificationPopup ref={notificationRef} />
        </SafeAreaView>
    );
};

// --- ESTILOS --- (Adicionar estilos para picker desabilitado e texto de motivo)
const styles = StyleSheet.create({
    // ... (estilos anteriores)
    pickerDisabled: {
        opacity: 0.5, // Deixa o picker mais transparente quando desabilitado
    },
    disabledReasonText: {
        fontSize: 12,
        color: '#A9A9A9',
        marginTop: -10, // Ajusta posição abaixo do picker
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
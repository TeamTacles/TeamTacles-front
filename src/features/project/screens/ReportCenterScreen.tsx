import React, { useState, useEffect, useCallback } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { PieChart, StackedBarChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';

import { RootStackParamList } from '../../../types/Navigation';
import { MainButton } from '../../../components/common/MainButton';
import { Header } from '../../../components/common/Header';
import { FilterPicker } from '../../task/components/FilterPicker';
import { TaskReportRow } from '../../task/components/TaskReportRow';
import { useProjectReport } from '../hooks/useProjectReport';
import { useAppContext } from '../../../contexts/AppContext';
import { getInitialsFromName } from '../../../utils/stringUtils';
import { projectService } from '../services/projectService';
import { projectReportService, MemberTaskDistributionDTO } from '../services/projectReportService';
import { TaskFilterReportDTO } from '../../task/services/taskService';
import { Task } from '../../../types/entities';
import { Text as SvgText } from 'react-native-svg';

type ReportCenterRouteProp = RouteProp<RootStackParamList, 'ReportCenter'>;
type ReportCenterNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STACKED_BAR_COLORS = ['#FFA500', '#FFD700', '#3CB371', '#ff4545'];
const STACKED_BAR_LEGEND = ['A Fazer', 'Em Andamento', 'Concluído', 'Atrasado'];
const STATUS_ORDER_KEYS: (keyof MemberTaskDistributionDTO['statusCounts'])[] = ['TO_DO', 'IN_PROGRESS', 'DONE', 'OVERDUE'];

const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0, 
    propsForLabels: {
        fontSize: 12,
        fontWeight: 'bold'
    },
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.substring(0, maxLength)}...`;
};

interface ReportTaskApiResponse {
    id: number;
    title: string;
    description: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
    dueDate: string;
    assignments: {
        userId: number;
        username: string;
    }[];
}


export const ReportCenterScreen = () => {
    const navigation = useNavigation<ReportCenterNavigationProp>();
    const route = useRoute<ReportCenterRouteProp>();
    const { projectId } = route.params;
    const { user } = useAppContext();

    const [projectName, setProjectName] = useState('Carregando...');
    const [memberItems, setMemberItems] = useState<{ label: string, value: number }[]>([]);

    const [filters, setFilters] = useState<TaskFilterReportDTO>({});

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

    const [appliedMemberName, setAppliedMemberName] = useState<string | null>(null);

    const {
        report,
        loading: loadingDashboard,
        initialLoading: initialLoadingDashboard,
        isExportingPdf,
        fetchDashboard,
        handleExportPdf,
        applyFilters,
        clearFilters: clearDashboardFilters,
    } = useProjectReport(projectId); 

    const statusItems = [
        { label: 'Todos Status', value: 'all', color: '#FFFFFF' },
        { label: 'A Fazer', value: 'TO_DO', color: '#FFA500' },
        { label: 'Em Andamento', value: 'IN_PROGRESS', color: '#FFD700' },
        { label: 'Concluído', value: 'DONE', color: '#3CB371' },
        { label: 'Atrasado', value: 'OVERDUE', color: '#ff4545' },
    ];

    const periodItems = [
        { label: 'Qualquer data', value: 'all' },
        { label: 'Últimos 7 dias', value: '7d' },
        { label: 'Últimos 30 dias', value: '30d' },
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const projectDetails = await projectService.getProjectById(projectId);
                setProjectName(projectDetails.title);

                const membersResponse = await projectService.getProjectMembers(projectId, 0, 100);
                const members = membersResponse.content.map(m => ({ label: m.username, value: m.userId }));
                setMemberItems([{ label: 'Todos Membros', value: 0 }, ...members]);
            } catch (error) {
                // Erro silencioso - não precisa exibir para o usuário
            }
        };

        if (user) {
            loadInitialData();
        }
    }, [projectId, user]);


    const fetchTasksForReport = useCallback(async (currentFilters: TaskFilterReportDTO) => {
        if (!projectId || !user) return;
        setLoadingTasks(true);
        try {
            const tasksFromApi: ReportTaskApiResponse[] = await projectReportService.getProjectTasksForReport(projectId, currentFilters);

            const mappedTasks: Task[] = tasksFromApi.map(apiTask => ({
                id: apiTask.id,
                title: apiTask.title,
                description: apiTask.description,
                dueDate: apiTask.dueDate,
                projectId: projectId,
                projectName: projectName,
                status: apiTask.status,
                createdAt: 0,
                assignments: apiTask.assignments,
            }));

            setTasks(mappedTasks);
        } catch (error) {
            setTasks([]);
        } finally {
            setLoadingTasks(false);
        }
    }, [projectId, user, projectName]);


    useEffect(() => {
        if (user && projectName !== 'Carregando...') {
            fetchTasksForReport(filters);
        }
    }, [user, fetchTasksForReport, projectName]);


    const handleGenerateReport = () => {
        const newFilters: TaskFilterReportDTO = {};

        const memberNameToApply = selectedMemberId
            ? memberItems.find(m => m.value === selectedMemberId)?.label
            : null;

        if (selectedMemberId && selectedMemberId !== 0) {
            newFilters.assignedUserId = selectedMemberId;
        }

        if (selectedStatus !== 'all') {
            if (selectedStatus === 'OVERDUE') {
                newFilters.isOverdue = true;
            } else {
                newFilters.taskStatus = selectedStatus as 'TO_DO' | 'IN_PROGRESS' | 'DONE';
            }
        }

        if (selectedPeriod !== 'all') {
            const now = new Date();
            const daysAgo = selectedPeriod === '7d' ? 7 : 30;
            const dateAfter = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            newFilters.createdAtAfter = dateAfter.toISOString().split('T')[0];
        }

        setFilters(newFilters);

        applyFilters(newFilters);

        fetchTasksForReport(newFilters);

        setAppliedMemberName(memberNameToApply || null);
    };

    const userProfileForHeader = user ? { initials: getInitialsFromName(user.name) } : { initials: '?' };
    const handleProfilePress = () => navigation.navigate('EditProfile');


    const combinedInitialLoading = initialLoadingDashboard || (loadingTasks && tasks.length === 0);

    if (combinedInitialLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
                 <Header
                     userProfile={userProfileForHeader}
                     onPressProfile={handleProfilePress}
                     notificationCount={0}
                     onPressNotifications={() => {}}
                 />
                 <View style={styles.loadingView}>
                     <ActivityIndicator size="large" color="#EB5F1C" />
                     <Text style={styles.loadingText}>Carregando relatório...</Text>
                 </View>
            </SafeAreaView>
         );
    }

    if (!report) {
         return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
                <Header
                    userProfile={userProfileForHeader}
                    onPressProfile={handleProfilePress}
                    notificationCount={0}
                    onPressNotifications={() => {}}
                />
                <View style={styles.emptyView}>
                    <Icon name="document-text-outline" size={80} color="#555" />
                    <Text style={styles.emptyText}>Nenhum dado disponível para o dashboard</Text>
                    <MainButton title="Tentar Novamente" onPress={() => fetchDashboard(filters)} />
                </View>
            </SafeAreaView>
        );
    }

    const { summary = { totalCount: 0, doneCount: 0, inProgressCount: 0, toDoCount: 0, overdueCount: 0 }, memberTaskDistribution: memberPerformanceRanking = [] } = report || {};


    const completionPercentage = summary && summary.totalCount > 0
        ? summary.doneCount / summary.totalCount
        : 0;

    const pieChartData = summary ? [
        { name: truncateText('Concluídas', 10), population: summary.doneCount, color: '#3CB371', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('Em Andamento', 10), population: summary.inProgressCount, color: '#FFD700', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('A Fazer', 10), population: summary.toDoCount, color: '#FFA500', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('Atrasadas', 10), population: summary.overdueCount, color: '#ff4545', legendFontColor: '#7F7F7F', legendFontSize: 14 },
    ].filter(item => item.population > 0) : [];


    const filteredRanking = selectedMemberId && selectedMemberId !== 0
        ? memberPerformanceRanking.filter(p => p.userId === selectedMemberId)
        : memberPerformanceRanking;

    const barChartData = (filteredRanking && filteredRanking.length > 0 && filteredRanking.some(p => p.totalTasksCount > 0)) ? {
        labels: filteredRanking.map(p => truncateText(p.username, 10)),
        legend: STACKED_BAR_LEGEND,
        data: filteredRanking.map(p =>
            STATUS_ORDER_KEYS.map(statusKey => {
                const value = p.statusCounts[statusKey] || 0;
                return value === 0 ? null : value;
            })
        ) as unknown as number[][],
        barColors: STACKED_BAR_COLORS,
        decimalPlaces: 0
    } : null;

    const barChartWidth = barChartData
        ? Math.max(Dimensions.get('window').width - 40, memberPerformanceRanking.length * 80)
        : Dimensions.get('window').width - 40;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <Header
                userProfile={userProfileForHeader}
                onPressProfile={handleProfilePress}
                notificationCount={0}
                onPressNotifications={() => {}}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.pageHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Central de Relatórios</Text>
                        <Text style={styles.subtitle}>Explore os dados do projeto {projectName}</Text>
                    </View>
                </View>

                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Filtros</Text>
                    <View style={styles.filterRow}>
                        <View style={styles.staticPickerContainer}>
                            <Text style={styles.staticPickerLabel}>Projeto</Text>
                            <View style={styles.staticPickerButton}>
                                <Text style={styles.staticPickerText} numberOfLines={1}>{projectName}</Text>
                            </View>
                        </View>
                        <FilterPicker
                            label="Membro"
                            style={{ width: '48%' }}
                            items={memberItems}
                            selectedValue={selectedMemberId || 0}
                            onValueChange={(v) => setSelectedMemberId(v === 0 ? null : v as number)}
                            placeholder="Todos"
                        />
                    </View>
                     <View style={styles.filterRow}>
                        <FilterPicker
                            label="Status Tarefa"
                            style={{ width: '48%' }}
                            items={statusItems}
                            selectedValue={selectedStatus}
                            onValueChange={(v) => setSelectedStatus(v as string)}
                        />
                        <FilterPicker
                            label="Criado em"
                            style={{ width: '48%' }}
                            items={periodItems}
                            selectedValue={selectedPeriod}
                            onValueChange={(v) => setSelectedPeriod(v as string)}
                        />
                    </View>
                    <MainButton
                        title="Gerar Relatório"
                        iconName="filter-outline"
                        onPress={handleGenerateReport}
                        disabled={loadingDashboard || loadingTasks}
                    />
                </View>

                {loadingDashboard ? (
                    <View style={styles.loadingView}>
                        <ActivityIndicator size="large" color="#EB5F1C" />
                        <Text style={styles.loadingText}>Carregando sumário...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.progressSection}>
                             <Text style={styles.sectionTitle}>Progresso Geral</Text>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressCircleContainer}>
                                    <Progress.Circle
                                        size={100}
                                        progress={completionPercentage}
                                        color={'#3CB371'}
                                        unfilledColor={'#3C3C3C'}
                                        borderWidth={0}
                                        thickness={8}
                                        showsText={true}
                                        formatText={() => `${Math.round(completionPercentage * 100)}%`}
                                        textStyle={styles.progressText}
                                    />
                                    <Text style={styles.progressSubLabel}>Tarefas concluídas</Text>
                                </View>
                                <View style={styles.totalTasksContainer}>
                                    <Text style={styles.totalTasksValue}>{summary.totalCount}</Text>
                                    <Text style={styles.totalTasksLabel}>
                                        {appliedMemberName
                                            ? `Tarefas totais\nde ${appliedMemberName}`
                                            : 'Tarefas Totais'
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {pieChartData.length > 0 && (
                             <View style={styles.chartContainer}>
                                <Text style={styles.sectionTitle}>Distribuição de Tarefas</Text>
                                <PieChart
                                    data={pieChartData}
                                    width={Dimensions.get('window').width - 40}
                                    height={170}
                                    chartConfig={chartConfig}
                                    accessor={"population"}
                                    backgroundColor={"transparent"}
                                    paddingLeft={"15"}
                                    center={[10, 0]}
                                    absolute
                                />
                            </View>
                        )}
                        
                        {barChartData && (
                            <View style={styles.chartContainer}>
                                <Text style={styles.sectionTitle}>Tarefas por Membro e Status</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <StackedBarChart
                                        data={barChartData}
                                        width={barChartWidth}
                                        height={250}
                                        yAxisLabel=""
                                        yAxisSuffix=""
                                        decimalPlaces={0}
                                        chartConfig={{
                                            ...chartConfig,
                                            decimalPlaces: 0,
                                        }}
                                        fromZero={true}
                                        segments={3}
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                            marginLeft: -15,
                                        }}
                                        hideLegend={false}
                                    />
                                </ScrollView>
                            </View>
                        )}


                        <View style={styles.tasksSection}>
                            <View style={styles.tasksSectionHeader}>
                                <Text style={styles.sectionTitle}>Detalhes das Tarefas</Text>
                                <TouchableOpacity
                                    onPress={handleExportPdf}
                                    disabled={isExportingPdf || loadingTasks}
                                    style={styles.exportButton}
                                >
                                    {isExportingPdf ? (
                                        <ActivityIndicator size="small" color="#EB5F1C" />
                                    ) : (
                                        <Icon name="download-outline" size={24} color="#EB5F1C" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {loadingTasks ? (
                                <ActivityIndicator size="large" color="#EB5F1C" style={{ marginVertical: 20 }} />
                            ) : (tasks?.length ?? 0) > 0 ? (
                                <>
                                    <View style={styles.taskHeaderRow}>
                                        <Text style={[styles.taskHeaderCol, styles.colTask]}>Tarefa</Text>
                                        <Text style={[styles.taskHeaderCol, styles.colResponsible]}>Responsável</Text>
                                        <Text style={[styles.taskHeaderCol, styles.colStatus]}>Status</Text>
                                        <Text style={[styles.taskHeaderCol, styles.colDueDate]}>Prazo</Text>
                                    </View>
                                    {(tasks ?? []).map(item => (
                                        <TaskReportRow key={item.id} task={item} />
                                    ))}
                                </>
                            ) : (
                                <Text style={styles.emptyTasksText}>
                                    Nenhuma tarefa encontrada com os filtros aplicados.
                                </Text>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    loadingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        color: '#A9A9A9',
        fontSize: 16,
    },
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: '#A9A9A9',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    scrollContainer: { paddingBottom: 40, paddingHorizontal: 15 },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        paddingTop: 10,
    },
    backButton: { marginRight: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#EB5F1C' },
    subtitle: { fontSize: 14, color: '#ffffffff' },
    sectionTitle: {
        color: '#E0E0E0',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    filterSection: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    staticPickerContainer: { width: '48%' },
    staticPickerLabel: { color: '#A9A9A9', fontSize: 14, marginBottom: 8 },
    staticPickerButton: {
        justifyContent: 'center',
        backgroundColor: '#3C3C3C',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
    },
    staticPickerText: { color: '#E0E0E0', fontSize: 16 },
    progressSection: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    progressCircleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    progressSubLabel: {
        fontSize: 14,
        color: '#A9A9A9',
        marginTop: 8,
        textAlign: 'center',
    },
    totalTasksContainer: {
        alignItems: 'center',
        minWidth: 100,
    },
    totalTasksValue: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    totalTasksLabel: {
        fontSize: 14,
        color: '#A9A9A9',
        marginTop: 4,
        textAlign: 'center',
    },
    chartContainer: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    tasksSection: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingVertical: 15, 
        paddingHorizontal: 15,
    },
    tasksSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
    },
    exportButton: {
        padding: 5,
    },
    taskHeaderRow: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
        marginBottom: 5,
    },
    taskHeaderCol: {
        color: '#A9A9A9',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingHorizontal: 4,
    },
    colTask: { flex: 3 },
    colResponsible: { flex: 2.5 },
    colStatus: { flex: 2.2 },
    colDueDate: { flex: 1.8, textAlign: 'right' },
    emptyTasksText: {
        color: '#A9A9A9',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 20,
    },
});
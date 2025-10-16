// src/screens/ReportCenterScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';

import { RootStackParamList } from '../types/Navigation';
import { MainButton } from '../components/MainButton';
import { Header } from '../components/Header';
import { FilterPicker } from '../components/FilterPicker';
import { TaskReportRow } from '../components/TaskReportRow';

// --- TIPOS (Baseados nos seus DTOs) ---
type TaskSummary = { totalCount: number; doneCount: number; inProgressCount: number; toDoCount: number; overdueCount: number; };
type MemberPerformance = { userId: number; username: string; completedTasksCount: number; };
type RecentTask = { id: number; title: string; projectName: string; status: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; dueDate: string; assignments: { username: string }[]; };

type ReportCenterRouteProp = RouteProp<RootStackParamList, 'ReportCenter'>;

// 1. Paleta de cores para as barras do gráfico
const barColorPalette = ['#EB5F1C', '#FFA500', '#FFD700', '#3CB371', '#4682B4'];

// Configuração dos gráficos
const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    // Função para colorir as barras individualmente
    getBarColor: (opacity = 1, index: number) => barColorPalette[index % barColorPalette.length],
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.substring(0, maxLength)}...`;
};

export const ReportCenterScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ReportCenterRouteProp>();
    const { projectId } = route.params;

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<TaskSummary | null>(null);
    const [tasks, setTasks] = useState<RecentTask[]>([]);
    const [projectName, setProjectName] = useState('Carregando...');
    const [performance, setPerformance] = useState<MemberPerformance[]>([]);

    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
    
    const [memberItems, setMemberItems] = useState<{ label: string, value: number }[]>([]);
    const statusItems = [ { label: 'Todos Status', value: 'all' }, { label: 'A Fazer', value: 'TO_DO' }, { label: 'Em Andamento', value: 'IN_PROGRESS' }, { label: 'Concluído', value: 'DONE' }, ];
    const periodItems = [ { label: 'Qualquer data', value: 'all' }, { label: 'Últimos 7 dias', value: '7d' }, { label: 'Últimos 30 dias', value: '30d' }, ];

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSummary({ totalCount: 33, doneCount: 12, inProgressCount: 18, toDoCount: 3, overdueCount: 3 });
            setTasks([
                { id: 1, title: 'Coletar Requisitos Funcionais', projectName: 'TeamTacles', assignments: [{username: 'Gabriela S.'}], status: 'DONE', dueDate: '2025-05-12T00:00:00Z' },
                { id: 2, title: 'Protótipo de Baixa Fidelidade', projectName: 'TeamTacles', assignments: [{username: 'Caio D.'}], status: 'IN_PROGRESS', dueDate: '2025-06-18T00:00:00Z' },
            ]);
            // Adicionando mais membros para testar o scroll
            setPerformance([
                { userId: 1, username: 'Caio Dib', completedTasksCount: 8 },
                { userId: 2, username: 'Gabriela S.', completedTasksCount: 12 },
                { userId: 3, username: 'João Victor Magalhães', completedTasksCount: 5 }, // Nome longo para teste
                { userId: 4, username: 'Ana M.', completedTasksCount: 7 },
                { userId: 5, username: 'Pedro L.', completedTasksCount: 9 },
                { userId: 6, username: 'Mariana C.', completedTasksCount: 11 },
                { userId: 7, username: 'Lucas F.', completedTasksCount: 4 },
            ]);
        } catch (error) {
            console.error("Erro ao buscar dados do relatório:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const projectDetails = { title: "Projeto TeamTacles" };
            const membersResponse = { content: [ { userId: 10, username: 'Gabriela Santana' }, { userId: 11, username: 'Caio Dib' } ] };

            setProjectName(projectDetails.title);
            const members = membersResponse.content.map(m => ({ label: m.username, value: m.userId }));
            setMemberItems([{ label: 'Todos Membros', value: 0 }, ...members]);
            
            handleGenerateReport();
        };
        loadInitialData();
    }, [projectId]);
    
    const completionPercentage = summary && summary.totalCount > 0 
        ? summary.doneCount / summary.totalCount 
        : 0;

    const pieChartData = summary ? [
        { name: truncateText('Concluídas', 10), population: summary.doneCount, color: '#3CB371', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('Em Andamento', 10), population: summary.inProgressCount, color: '#FFD700', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('A Fazer', 10), population: summary.toDoCount, color: '#FFA500', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('Atrasadas', 10), population: summary.overdueCount, color: '#ff4545', legendFontColor: '#7F7F7F', legendFontSize: 14 },
    ].filter(item => item.population > 0) : [];

    const barChartData = {
        labels: performance.map(p => truncateText(p.username, 10)),
        datasets: [{
            data: performance.map(p => p.completedTasksCount),
            // Adicionando as cores ao dataset
            colors: performance.map((_, index) => (opacity = 1) => barColorPalette[index % barColorPalette.length])
        }]
    };
    
    // Cálculo da largura dinâmica do gráfico de barras
    const barChartWidth = Math.max(Dimensions.get('window').width - 40, performance.length * 80);


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header userProfile={{ initials: 'CD' }} onPressProfile={() => {}} notificationCount={0} onPressNotifications={() => {}} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.pageHeader}>
                     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Central de Relatórios</Text>
                        <Text style={styles.subtitle}>Explore os dados do seu projeto</Text>
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
                        <FilterPicker label="Membro" style={{ width: '48%' }} items={memberItems} selectedValue={selectedMemberId} onValueChange={(v) => setSelectedMemberId(v === 0 ? null : v as number)} placeholder="Todos" />
                    </View>
                    <View style={styles.filterRow}>
                        <FilterPicker label="Status" style={{ width: '48%' }}  items={statusItems} selectedValue={selectedStatus} onValueChange={(v) => setSelectedStatus(v as string)} />
                        <FilterPicker label="Período" style={{ width: '48%' }}  items={periodItems} selectedValue={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as string)} />
                    </View>
                    <MainButton title="Gerar Relatório" iconName="archive-outline" onPress={handleGenerateReport} />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#EB5F1C" style={{ marginTop: 40 }}/>
                ) : summary && (
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
                                </View>
                                <View style={styles.totalTasksContainer}>
                                    <Text style={styles.totalTasksValue}>{summary.totalCount}</Text>
                                    <Text style={styles.totalTasksLabel}>Tarefas no Projeto</Text>
                                </View>
                            </View>
                        </View>

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
                        
                        <View style={styles.chartContainer}>
                             <Text style={styles.sectionTitle}>Tarefas Concluídas por Membro</Text>
                             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <BarChart
                                    data={barChartData}
                                    width={barChartWidth}
                                    height={250}
                                    yAxisLabel=""
                                    yAxisSuffix=""
                                    chartConfig={chartConfig}
                                    verticalLabelRotation={-25}
                                    fromZero={true}
                                    showValuesOnTopOfBars={true}
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                        marginLeft: -30,
                                    }}
                                    withCustomBarColorFromData={true}
                                />
                             </ScrollView>
                        </View>
                        
                        <View style={styles.tasksSection}>
                            <Text style={styles.sectionTitle}>Detalhes das Tarefas</Text>
                            <View style={styles.taskHeaderRow}>
                                <Text style={[styles.taskHeaderCol, styles.colTask]}>Tarefa</Text>
                                <Text style={[styles.taskHeaderCol, styles.colProject]}>Projeto</Text>
                                <Text style={[styles.taskHeaderCol, styles.colResponsible]}>Responsável</Text>
                                <Text style={[styles.taskHeaderCol, styles.colStatus]}>Status</Text>
                                <Text style={[styles.taskHeaderCol, styles.colDueDate]}>Prazo</Text>
                            </View>
                            {tasks.map(item => <TaskReportRow key={item.id} task={item} />)}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    scrollContainer: { paddingBottom: 40, paddingHorizontal: 15, },
    pageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingTop: 10, },
    backButton: { marginRight: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#EB5F1C' },
    subtitle: { fontSize: 14, color: '#ffffffff' },
    sectionTitle: { color: '#E0E0E0', fontSize: 18, fontWeight: 'bold', marginBottom: 20, },
    filterSection: { backgroundColor: '#2A2A2A', borderRadius: 15, padding: 20, marginBottom: 20, },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
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
    totalTasksContainer: {
        alignItems: 'center',
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
    },
    chartContainer: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 20, // Ajuste para o scrollview
        marginBottom: 20,
        alignContent: 'center',
        alignItems: 'center'
    },
    tasksSection: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    taskHeaderRow: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
        marginBottom: 5,
        alignItems: 'flex-start',
    },
    taskHeaderCol: {
        color: '#A9A9A9',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingHorizontal: 4,
    },
    colTask: { flex: 2.8 },
    colProject: { flex: 2 },
    colResponsible: { flex: 2.5 },
    colStatus: { flex: 2.2 },
    colDueDate: { flex: 1.8, textAlign: 'right' },
    staticPickerContainer: { width: '48%', marginBottom: 15 },
    staticPickerLabel: { color: '#A9A9A9', fontSize: 14, marginBottom: 8 },
    staticPickerButton: { justifyContent: 'center', backgroundColor: '#3C3C3C', borderRadius: 8, paddingHorizontal: 12, height: 45 },
    staticPickerText: { color: '#E0E0E0', fontSize: 16 },
});

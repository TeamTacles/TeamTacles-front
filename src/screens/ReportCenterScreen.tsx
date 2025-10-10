// src/screens/ReportCenterScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { RootStackParamList } from '../types/Navigation';
import { MainButton } from '../components/MainButton';
import { Header } from '../components/Header';
import { FilterPicker } from '../components/FilterPicker';
import { TaskReportRow } from '../components/TaskReportRow';
// import { projectService } from '../services/projectService';
// import { taskService } from '../services/taskService';

// --- TIPOS ---
type TaskSummary = { totalCount: number; doneCount: number; inProgressCount: number; overdueCount: number; };
type RecentTask = { id: number; title: string; projectName: string; status: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; dueDate: string; assignments: { username: string }[]; };

// --- COMPONENTE DE KPI COM COR ---
const KpiCard = ({ title, value, color }: { title: string, value: number, color?: string }) => (
    <View style={styles.kpiCard}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Text style={[styles.kpiValue, { color: color || '#FFFFFF' }]}>{value}</Text>
    </View>
);

type ReportCenterRouteProp = RouteProp<RootStackParamList, 'ReportCenter'>;

export const ReportCenterScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ReportCenterRouteProp>();
    const { projectId } = route.params;

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<TaskSummary | null>(null);
    const [tasks, setTasks] = useState<RecentTask[]>([]);
    const [projectName, setProjectName] = useState('Carregando...');

    // --- ESTADOS DOS FILTROS (PROJETO REMOVIDO) ---
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
    
    const [memberItems, setMemberItems] = useState<{ label: string, value: number }[]>([]);
    const statusItems = [ { label: 'Todos Status', value: 'all' }, { label: 'A Fazer', value: 'TO_DO' }, { label: 'Em Andamento', value: 'IN_PROGRESS' }, { label: 'Concluído', value: 'DONE' }, ];
    const periodItems = [ { label: 'Qualquer data', value: 'all' }, { label: 'Últimos 7 dias', value: '7d' }, { label: 'Últimos 30 dias', value: '30d' }, ];

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            // DADOS MOCADOS
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            setSummary({ totalCount: 33, doneCount: 12, inProgressCount: 18, overdueCount: 3 });
            setTasks([
                { id: 1, title: 'Coletar Requisitos Funcionais', projectName: 'TeamTacles', assignments: [{username: 'Gabriela S.'}], status: 'DONE', dueDate: '2025-05-12T00:00:00Z' },
                { id: 2, title: 'Protótipo de Baixa Fidelidade', projectName: 'TeamTacles', assignments: [{username: 'Caio D.'}], status: 'IN_PROGRESS', dueDate: '2025-06-18T00:00:00Z' },
            ]);
        } catch (error) {
            console.error("Erro ao buscar dados do relatório:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Busca os dados do projeto (nome) e membros para os filtros
        const loadInitialData = async () => {
            // const projectDetails = await projectService.getProjectById(projectId);
            // const membersResponse = await projectService.getProjectMembers(projectId);
            
            // MOCK
            const projectDetails = { title: "Projeto TeamTacles" };
            const membersResponse = { content: [ { userId: 10, username: 'Gabriela Santana' }, { userId: 11, username: 'Caio Dib' } ] };

            setProjectName(projectDetails.title);
            const members = membersResponse.content.map(m => ({ label: m.username, value: m.userId }));
            setMemberItems([{ label: 'Todos Membros', value: 0 }, ...members]);
            
            handleGenerateReport();
        };
        loadInitialData();
    }, [projectId]);

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
                        {/* FILTRO DE PROJETO SUBSTITUÍDO POR TEXTO ESTÁTICO */}
                        <View style={styles.staticPickerContainer}>
                            <Text style={styles.staticPickerLabel}>Projeto</Text>
                            <View style={styles.staticPickerButton}>
                                <Text style={styles.staticPickerText} numberOfLines={1}>{projectName}</Text>
                            </View>
                        </View>
                        <FilterPicker label="Membro" items={memberItems} selectedValue={selectedMemberId} onValueChange={(v) => setSelectedMemberId(v === 0 ? null : v as number)} placeholder="Todos" />
                    </View>
                    <View style={styles.filterRow}>
                        <FilterPicker label="Status" items={statusItems} selectedValue={selectedStatus} onValueChange={(v) => setSelectedStatus(v as string)} />
                        <FilterPicker label="Período" items={periodItems} selectedValue={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as string)} />
                    </View>
                    <MainButton title="Gerar Relatório" iconName="archive-outline" onPress={handleGenerateReport} />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#EB5F1C" style={{ marginTop: 40 }}/>
                ) : summary && (
                    <>
                        <View style={styles.kpiContainer}>
                            <KpiCard title="Total de Tarefas" value={summary.totalCount} />
                            <KpiCard title="Concluídas" value={summary.doneCount} color="#3CB371" />
                            <KpiCard title="Em Andamento" value={summary.inProgressCount} color="#FFD700" />
                            <KpiCard title="Atrasadas" value={summary.overdueCount} color="#ff4545" />
                        </View>
                        
                        <View style={styles.tasksSection}>
                            <Text style={styles.sectionTitle}>Tarefas Recentes</Text>
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
    kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20,},
    kpiCard: { backgroundColor: '#2A2A2A', borderRadius: 15, padding: 15, width: '48%', marginBottom: 15, },
    kpiTitle: { color: '#ffffffff', fontSize: 14, marginBottom: 4, },
    kpiValue: { fontSize: 32, fontWeight: 'bold' },
    tasksSection: {
        marginTop: 30,
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingTop: 20, // Padding vertical no container
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20
    },
    taskHeaderRow: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
        marginBottom: 5,
        paddingHorizontal: 15,
                alignItems: 'flex-start',
 // Padding horizontal aqui
    },
    taskHeaderCol: {
        color: '#A9A9A9',
        fontSize: 7, // Reduzido
        fontWeight: 'bold',
        textTransform: 'uppercase', // Adicionado
        paddingHorizontal: 4,
    },
    // Flexbox para o header (deve ser igual ao do TaskReportRow)
    colTask: {
        flex: 2.8,
    },
    colProject: {
        flex: 2,
    },
    colResponsible: {
        flex: 2.5,
    },
    colStatus: {
        flex: 2.2,
    },
    colDueDate: {
        flex: 1.8,
        textAlign: 'right',
    },
    // Estilos para o campo de projeto estático
    staticPickerContainer: { width: '48%', marginBottom: 15 },
    staticPickerLabel: { color: '#A9A9A9', fontSize: 14, marginBottom: 8 },
    staticPickerButton: { justifyContent: 'center', backgroundColor: '#3C3C3C', borderRadius: 8, paddingHorizontal: 12, height: 45 },
    staticPickerText: { color: '#E0E0E0', fontSize: 16 },
});
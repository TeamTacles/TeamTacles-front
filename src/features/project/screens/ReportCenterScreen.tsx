// src/features/project/screens/ReportCenterScreen.tsx

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// --- CORREÇÃO: Tipar useNavigation corretamente ---
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// --- FIM CORREÇÃO ---
import Icon from 'react-native-vector-icons/Ionicons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';

import { RootStackParamList } from '../../../types/navigation';
import { MainButton } from '../../../components/common/MainButton';
import { Header } from '../../../components/common/Header';
import { FilterPicker } from '../../task/components/FilterPicker';
import { TaskReportRow } from '../../task/components/TaskReportRow';
import { useProjectReport } from '../hooks/useProjectReport';
import { useAppContext } from '../../../contexts/AppContext';
import { getInitialsFromName } from '../../../utils/stringUtils';
import { projectService } from '../services/projectService'; // Para buscar nome/membros iniciais
import { projectReportService } from '../services/projectReportService'; // Para buscar tarefas do relatório
import { TaskFilterReportDTO } from '../../task/services/taskService'; // Tipo dos filtros
// --- ADICIONADO: Importar tipo Task ---
import { Task } from '../../../types/entities'; // Tipo usado no TaskReportRow
// --- FIM ADICIONADO ---


type ReportCenterRouteProp = RouteProp<RootStackParamList, 'ReportCenter'>;
// --- CORREÇÃO: Tipar Navigation ---
type ReportCenterNavigationProp = NativeStackNavigationProp<RootStackParamList>;
// --- FIM CORREÇÃO ---

// Paleta de cores para as barras do gráfico
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
    propsForLabels: {
        fontSize: 12,
    },
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.substring(0, maxLength)}...`;
};

// --- ADICIONADO: Interface para a resposta da API de tarefas do relatório ---
// Ajuste os campos conforme o que seu backend retorna em getProjectTasksForReport
interface ReportTaskApiResponse {
    id: number;
    title: string;
    description: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    dueDate: string; // ISO 8601 string
    assignments: {
        userId: number;
        username: string;
    }[];
    // Adicione createdAt, ownerId, etc., se forem retornados e necessários
}
// --- FIM ADICIONADO ---


export const ReportCenterScreen = () => {
    // --- CORREÇÃO: Tipar Navigation ---
    const navigation = useNavigation<ReportCenterNavigationProp>();
    // --- FIM CORREÇÃO ---
    const route = useRoute<ReportCenterRouteProp>();
    const { projectId } = route.params;
    const { user } = useAppContext();

    // Estado local para nome do projeto e membros (para filtros)
    const [projectName, setProjectName] = useState('Carregando...');
    const [memberItems, setMemberItems] = useState<{ label: string, value: number }[]>([]);

    // Filtros locais aplicados às tarefas
    const [filters, setFilters] = useState<TaskFilterReportDTO>({});

    // --- ADICIONADO: Estados para as Tarefas ---
    const [tasks, setTasks] = useState<Task[]>([]); // Usar o tipo Task da sua entidade
    const [loadingTasks, setLoadingTasks] = useState(false);
    // --- FIM ADICIONADO ---

    // Filtros dos Pickers
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all'); // Mantido 'all' como padrão para período

    // Hook customizado para gerenciar o DASHBOARD (sumário, ranking) e PDF
    const {
        report, // Contém summary e ranking
        loading: loadingDashboard, // Renomeado para evitar conflito
        initialLoading: initialLoadingDashboard, // Renomeado
        isExportingPdf,
        fetchDashboard, // Busca apenas summary/ranking
        handleExportPdf, // Usa o estado 'filters' atual para exportar
        applyFilters: applyDashboardFilters, // Aplica filtros e refaz busca do DASHBOARD
        clearFilters: clearDashboardFilters, // Limpa filtros e refaz busca do DASHBOARD
    } = useProjectReport(projectId); // Hook agora gerencia SÓ dashboard e PDF

    // Itens para os pickers
    const statusItems = [
        { label: 'Todos Status', value: 'all' },
        { label: 'A Fazer', value: 'TO_DO' },
        { label: 'Em Andamento', value: 'IN_PROGRESS' },
        { label: 'Concluído', value: 'DONE' },
        // Adicione 'OVERDUE' se o backend suportar filtrar por status OVERDUE diretamente
        // { label: 'Atrasado', value: 'OVERDUE' },
    ];

    const periodItems = [
        { label: 'Qualquer data', value: 'all' }, // Renomeado para clareza
        { label: 'Últimos 7 dias', value: '7d' },
        { label: 'Últimos 30 dias', value: '30d' },
    ];

    // Carrega dados iniciais do projeto (nome e membros para filtros)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // --- CORREÇÃO: Remover argumento 'user' ---
                const projectDetails = await projectService.getProjectById(projectId);
                setProjectName(projectDetails.title);

                // --- CORREÇÃO: Remover argumento 'user' ---
                const membersResponse = await projectService.getProjectMembers(projectId, 0, 100); // Buscar todos membros para o filtro
                // --- FIM CORREÇÃO ---
                const members = membersResponse.content.map(m => ({ label: m.username, value: m.userId }));
                setMemberItems([{ label: 'Todos Membros', value: 0 }, ...members]);
            } catch (error) {
                console.error('Erro ao carregar dados iniciais:', error);
                // Tratar erro, talvez mostrar notificação
            }
        };

        if (user) {
            loadInitialData();
        }
    }, [projectId, user]);


    // --- ADICIONADO: Função para buscar Tarefas ---
    const fetchTasksForReport = useCallback(async (currentFilters: TaskFilterReportDTO) => {
        if (!projectId || !user) return;
        setLoadingTasks(true);
        try {
            // Usar a função correta do service
            const tasksFromApi: ReportTaskApiResponse[] = await projectReportService.getProjectTasksForReport(projectId, currentFilters);

            // Mapear a resposta da API para o tipo Task esperado pelo TaskReportRow
            const mappedTasks: Task[] = tasksFromApi.map(apiTask => ({
                id: apiTask.id,
                title: apiTask.title,
                description: apiTask.description, // Incluído
                dueDate: apiTask.dueDate,
                projectId: projectId, // Adicionado se TaskReportRow precisar
                projectName: projectName, // Adicionado se TaskReportRow precisar
                status: apiTask.status,
                createdAt: 0, // Adicione um valor padrão ou busque se a API retornar
                // Mapeie 'assignments' se TaskReportRow usar uma estrutura diferente
                assignments: apiTask.assignments,
            }));

            setTasks(mappedTasks);
        } catch (error) {
            console.error('Erro ao buscar tarefas para relatório:', error);
            setTasks([]); // Limpar tarefas em caso de erro
            // Opcional: Mostrar notificação de erro
            // showNotification({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setLoadingTasks(false);
        }
    }, [projectId, user, projectName]); // Depende de projectId, user e projectName
    // --- FIM ADICIONADO ---


    // --- MODIFICADO: useEffect para buscar tarefas iniciais ---
    // Buscar tarefas depois que os dados iniciais (nome do projeto) foram carregados
    useEffect(() => {
        // Busca tarefas iniciais *depois* que o nome do projeto está disponível e o user existe
        if (user && projectName !== 'Carregando...') {
            fetchTasksForReport(filters); // Busca com filtros vazios inicialmente
        }
        // fetchDashboard é chamado dentro do useProjectReport, não precisa chamar aqui
    }, [user, fetchTasksForReport, projectName]); // Depende do user e da função de busca, e projectName
    // --- FIM MODIFICADO ---


    // Função para aplicar filtros e gerar o relatório
    const handleGenerateReport = () => {
        const newFilters: TaskFilterReportDTO = {}; // Usar o tipo correto

        if (selectedMemberId && selectedMemberId !== 0) {
            newFilters.assignedUserId = selectedMemberId;
        }

        if (selectedStatus !== 'all') {
            // Garante que o status corresponda ao Enum esperado pelo backend
            newFilters.status = selectedStatus as 'TO_DO' | 'IN_PROGRESS' | 'DONE';
             // Se você adicionou 'OVERDUE' e o backend suporta:
             // if (selectedStatus === 'OVERDUE') {
             //    newFilters.isOverdue = true; // Ou o parâmetro que seu backend espera
             //    delete newFilters.status; // Remove status se estiver filtrando por overdue
             // } else {
             //    newFilters.status = selectedStatus as 'TO_DO' | 'IN_PROGRESS' | 'DONE';
             // }
        }

        // --- CORREÇÃO: Filtragem por Data de Criação (createdAt) ---
        if (selectedPeriod !== 'all') {
            const now = new Date();
            const daysAgo = selectedPeriod === '7d' ? 7 : 30;
            // Cria uma nova data para não modificar 'now' diretamente
            const dateAfter = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            // Formata como YYYY-MM-DD para a API
            newFilters.createdAtAfter = dateAfter.toISOString().split('T')[0];
            // Opcional: Definir createdAtBefore como 'hoje' se necessário
            // newFilters.createdAtBefore = new Date().toISOString().split('T')[0];
        }
        // --- FIM CORREÇÃO ---

        setFilters(newFilters); // Atualiza o estado local de filtros
        applyDashboardFilters(newFilters); // Atualiza filtros no hook (refaz busca do dashboard)
        fetchTasksForReport(newFilters); // Busca tarefas com os novos filtros
    };

    // Perfil para o Header
    const userProfileForHeader = user ? { initials: getInitialsFromName(user.name) } : { initials: '?' };
    // --- CORREÇÃO: Navegação para EditProfile ---
    // A tipagem deve funcionar agora com useNavigation<ReportCenterNavigationProp>()
    const handleProfilePress = () => navigation.navigate('EditProfile');
    // --- FIM CORREÇÃO ---


    // Loading inicial combinado (espera dashboard E tarefas iniciais)
    const combinedInitialLoading = initialLoadingDashboard || (loadingTasks && tasks.length === 0);

    if (combinedInitialLoading) { // Verifica loading combinado
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
                     <Text style={styles.loadingText}>Carregando relatório...</Text>
                 </View>
            </SafeAreaView>
         );
    }

    // Se não houver dados do dashboard após o loading inicial
    if (!report) {
         return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <Header
                    userProfile={userProfileForHeader}
                    onPressProfile={handleProfilePress}
                    notificationCount={0}
                    onPressNotifications={() => {}}
                />
                <View style={styles.emptyView}>
                    <Icon name="document-text-outline" size={80} color="#555" />
                    <Text style={styles.emptyText}>Nenhum dado disponível para o dashboard</Text>
                    {/* Botão para tentar recarregar o DASHBOARD */}
                    <MainButton title="Tentar Novamente" onPress={fetchDashboard} />
                </View>
            </SafeAreaView>
        );
    }

    // Desestruturação segura do report
    const { summary = { totalCount: 0, doneCount: 0, inProgressCount: 0, toDoCount: 0, overdueCount: 0 }, memberPerformanceRanking = [] } = report || {};


    // Calcula a porcentagem de conclusão
    const completionPercentage = summary && summary.totalCount > 0
        ? summary.doneCount / summary.totalCount
        : 0;

    // Dados para o gráfico de pizza
    const pieChartData = summary ? [
        { name: truncateText('Concluídas', 10), population: summary.doneCount, color: '#3CB371', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('Em Andamento', 10), population: summary.inProgressCount, color: '#FFD700', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('A Fazer', 10), population: summary.toDoCount, color: '#FFA500', legendFontColor: '#7F7F7F', legendFontSize: 14 },
        { name: truncateText('Atrasadas', 10), population: summary.overdueCount, color: '#ff4545', legendFontColor: '#7F7F7F', legendFontSize: 14 },
    ].filter(item => item.population > 0) : [];

    // Dados para o gráfico de barras
    const barChartData = memberPerformanceRanking && memberPerformanceRanking.length > 0 ? {
        labels: memberPerformanceRanking.map(p => truncateText(p.username, 10)),
        datasets: [{
            data: memberPerformanceRanking.map(p => p.completedTasksCount),
            colors: memberPerformanceRanking.map((_, index) => (opacity = 1) => barColorPalette[index % barColorPalette.length])
        }]
    } : null;

    // Cálculo da largura dinâmica do gráfico de barras
    const barChartWidth = barChartData
        ? Math.max(Dimensions.get('window').width - 40, memberPerformanceRanking.length * 80)
        : Dimensions.get('window').width - 40;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userProfileForHeader}
                onPressProfile={handleProfilePress}
                notificationCount={0}
                onPressNotifications={() => {}}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Cabeçalho da Página */}
                <View style={styles.pageHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back-outline" size={30} color="#EB5F1C" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Central de Relatórios</Text>
                        <Text style={styles.subtitle}>Explore os dados do projeto {projectName}</Text>
                    </View>
                </View>

                {/* Seção de Filtros */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Filtros</Text>
                    <View style={styles.filterRow}>
                        {/* Picker Estático para Projeto */}
                        <View style={styles.staticPickerContainer}>
                            <Text style={styles.staticPickerLabel}>Projeto</Text>
                            <View style={styles.staticPickerButton}>
                                <Text style={styles.staticPickerText} numberOfLines={1}>{projectName}</Text>
                            </View>
                        </View>
                        {/* Picker Dinâmico para Membro */}
                        <FilterPicker
                            label="Membro"
                            style={{ width: '48%' }}
                            items={memberItems}
                            selectedValue={selectedMemberId || 0}
                            onValueChange={(v) => setSelectedMemberId(v === 0 ? null : v as number)}
                            placeholder="Todos" // Placeholder quando 'Todos Membros' (valor 0) é selecionado
                        />
                    </View>
                     <View style={styles.filterRow}>
                        {/* Picker Dinâmico para Status */}
                        <FilterPicker
                            label="Status Tarefa" // Label ajustado
                            style={{ width: '48%' }}
                            items={statusItems}
                            selectedValue={selectedStatus}
                            onValueChange={(v) => setSelectedStatus(v as string)}
                        />
                        {/* Picker Dinâmico para Período */}
                        <FilterPicker
                            label="Criado em" // Label ajustado
                            style={{ width: '48%' }}
                            items={periodItems}
                            selectedValue={selectedPeriod}
                            onValueChange={(v) => setSelectedPeriod(v as string)}
                        />
                    </View>
                    <MainButton
                        title="Gerar Relatório"
                        iconName="filter-outline" // Ícone ajustado
                        onPress={handleGenerateReport}
                        // Desabilita se dashboard OU tarefas estiverem carregando
                        disabled={loadingDashboard || loadingTasks}
                    />
                </View>

                {/* --- Condicional usa loadingDashboard --- */}
                {loadingDashboard ? (
                    <View style={styles.loadingView}>
                        <ActivityIndicator size="large" color="#EB5F1C" />
                        <Text style={styles.loadingText}>Carregando sumário...</Text>
                    </View>
                ) : (
                    <>
                        {/* Seção de Progresso Geral (usa 'summary') */}
                        <View style={styles.progressSection}>
                            {/* ... conteúdo do progresso ... */}
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
                                    <Text style={styles.totalTasksLabel}>Tarefas Totais</Text>
                                </View>
                            </View>
                        </View>

                        {/* Gráfico de Pizza - Distribuição de Tarefas (usa 'summary') */}
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

                        {/* Gráfico de Barras - Tarefas Concluídas por Membro (usa 'memberPerformanceRanking') */}
                        {barChartData && barChartData.datasets[0].data.length > 0 && (
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
                                            marginLeft: -30, // Ajuste para centralizar
                                        }}
                                        withCustomBarColorFromData={true}
                                        flatColor={true} // Garante cores do dataset
                                    />
                                </ScrollView>
                            </View>
                        )}

                        {/* Seção de Tarefas Detalhadas */}
                        <View style={styles.tasksSection}>
                            <View style={styles.tasksSectionHeader}>
                                <Text style={styles.sectionTitle}>Detalhes das Tarefas</Text>
                                <TouchableOpacity
                                    onPress={handleExportPdf}
                                    // Desabilita se estiver exportando OU carregando tarefas
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

                            {/* --- Condicional usa loadingTasks --- */}
                            {loadingTasks ? (
                                <ActivityIndicator size="large" color="#EB5F1C" style={{ marginVertical: 20 }} />
                            ) : tasks.length > 0 ? (
                                <>
                                    <View style={styles.taskHeaderRow}>
                                        <Text style={[styles.taskHeaderCol, styles.colTask]}>Tarefa</Text>
                                        <Text style={[styles.taskHeaderCol, styles.colResponsible]}>Responsável</Text>
                                        <Text style={[styles.taskHeaderCol, styles.colStatus]}>Status</Text>
                                        <Text style={[styles.taskHeaderCol, styles.colDueDate]}>Prazo</Text>
                                    </View>
                                    {/* Mapeia o estado 'tasks' */}
                                    {tasks.map(item => (
                                        // Passa o item mapeado do tipo Task
                                        <TaskReportRow key={item.id} task={item} />
                                    ))}
                                </>
                            ) : (
                                <Text style={styles.emptyTasksText}>
                                    Nenhuma tarefa encontrada com os filtros aplicados.
                                </Text>
                            )}
                            {/* --- FIM Condicional --- */}
                        </View>
                    </>
                )}
                 {/* --- FIM Condicional --- */}
            </ScrollView>
        </SafeAreaView>
    );
};


// --- Estilos (mantidos, mas revisados para clareza) ---
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
        marginBottom: 15, // Leve ajuste
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
    // Estilos para Picker Estático (Projeto)
    staticPickerContainer: { width: '48%' },
    staticPickerLabel: { color: '#A9A9A9', fontSize: 14, marginBottom: 8 },
    staticPickerButton: {
        justifyContent: 'center', // Centraliza verticalmente
        backgroundColor: '#3C3C3C',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45, // Altura padrão
    },
    staticPickerText: { color: '#E0E0E0', fontSize: 16 },
    // Seção Progresso
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
    // Contêineres dos Gráficos
    chartContainer: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 10, // Ajuste se necessário
        marginBottom: 20,
        alignItems: 'center', // Centraliza conteúdo
    },
    // Seção Detalhes das Tarefas
    tasksSection: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        paddingVertical: 15, // Ajuste
        paddingHorizontal: 15,
    },
    tasksSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15, // Ajuste
        paddingBottom: 10, // Adiciona espaço abaixo
        borderBottomWidth: 1, // Separador visual
        borderBottomColor: '#3C3C3C',
    },
    exportButton: {
        padding: 5,
    },
    // Cabeçalho da Tabela de Tarefas
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
    // Larguras das colunas (ajuste conforme necessário)
    colTask: { flex: 3 },
    colResponsible: { flex: 2.5 },
    colStatus: { flex: 2.2 },
    colDueDate: { flex: 1.8, textAlign: 'right' },
    // Texto para quando não há tarefas
    emptyTasksText: {
        color: '#A9A9A9',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 20,
    },
});
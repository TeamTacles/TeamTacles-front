// src/screens/TaskScreen.tsx

import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, RootTabParamList } from "../types/Navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '../components/EmptyState';
import { useAppContext } from "../contexts/AppContext";
import { useProjects } from "../hooks/useProjects";
import { Task } from "../hooks/useTasks";
import { TaskCard } from "../components/TaskCard";
import { FilterModal, Filters } from "../components/FilterModal";
import { FilterButton } from "../components/FilterButton";

const polvo_tasks = require('../assets/polvo_tasks.png');

// --- DADOS MOCADOS PARA A TELA DE TAREFAS ---
const MOCK_TASKS: Task[] = [
    {
        id: 101,
        title: 'Revisar protótipo de alta fidelidade',
        description: 'Verificar todos os fluxos de usuário.',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // Prazo: 5 dias a partir de hoje
        projectId: 1,
        projectName: 'Projeto TeamTacles',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 86400000 * 2).getTime(), // Criado há 2 dias
    },
    {
        id: 102,
        title: 'Desenvolver tela de Login',
        description: 'Implementar a interface e a lógica de autenticação.',
        dueDate: new Date(Date.now() + 86400000 * 10).toISOString(), // Prazo: 10 dias
        projectId: 1,
        projectName: 'Projeto TeamTacles',
        status: 'TO_DO',
        createdAt: new Date(Date.now() - 86400000).getTime(), // Criado ontem
    },
    {
        id: 103,
        title: 'Configurar ambiente de testes',
        description: 'Instalar e configurar o Jest e a Testing Library.',
        dueDate: new Date('2025-10-10T23:59:59Z').toISOString(), // Prazo: 10 de Outubro de 2025 (atrasado)
        projectId: 2,
        projectName: 'Website Redesign',
        status: 'TO_DO',
        createdAt: new Date('2025-10-01T23:59:59Z').getTime(),
    },
    {
        id: 104,
        title: 'Entregar relatório de performance',
        description: 'Gerar o relatório do último trimestre.',
        dueDate: new Date('2025-09-30T23:59:59Z').toISOString(), // Prazo: 30 de Setembro de 2025 (concluído)
        projectId: 2,
        projectName: 'Website Redesign',
        status: 'DONE',
        createdAt: new Date('2025-09-15T23:59:59Z').getTime(),
    },
];
// --- FIM DOS DADOS MOCADOS ---


type TaskScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Tarefas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TaskScreen = ({ navigation }: TaskScreenNavigationProp) => {
    // Agora usamos um estado local inicializado com os dados mocados
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const { signed } = useAppContext();
    const { projects } = useProjects(signed); 
    
    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});

    const userWithAvatar = { initials: 'CD' };

    const handleProfilePress = () => Alert.alert("Perfil Clicado!");
    const handleNotificationsPress = () => Alert.alert("Notificações Clicadas!");

    const handleNewTask = () => {
        if (projects.length === 0) {
            Alert.alert("Nenhum Projeto Encontrado", "Você precisa criar um projeto antes de poder adicionar uma tarefa.");
            return;
        }
        navigation.navigate('TaskForm');
    };

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setFilterModalVisible(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        setFilterModalVisible(false);
    };
    
    const filteredTasks = useMemo(() => {
        return tasks
            .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
            .filter(t => {
                if (filters.status && t.status !== filters.status) return false;

                const taskDate = new Date(t.createdAt);
                if (filters.createdAtAfter && taskDate < filters.createdAtAfter) return false;
                if (filters.createdAtBefore && taskDate > filters.createdAtBefore) return false;
                
                return true;
            });
    }, [search, tasks, filters]);

    return (
        <SafeAreaView style={styles.safeAreaView} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar title="Suas tarefas" placeholder="Pesquisar Tarefas" onChangeText={setSearch} />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>
            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onPress={() => navigation.navigate('TaskDetail', { projectId: item.projectId, taskId: item.id })}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <EmptyState
                        imageSource={polvo_tasks}
                        title="Nenhuma tarefa por aqui!"
                        subtitle="Crie tarefas dentro de um projeto."
                    />
                }
            />
            <FilterModal
                visible={isFilterModalVisible}
                filterType="tasks"
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaView: { 
        flex: 1, 
        backgroundColor: '#191919' 
    },
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        paddingRight: 15 
    },
    searchBarWrapper: { 
        flex: 1 
    },
    filterButtonPosition: { 
        marginTop: 75 
    },
    listContainer: { 
        flexGrow: 1, 
        paddingHorizontal: 15, 
        paddingBottom: 80 
    },
    addButtonContainer: { 
        position: 'absolute', 
        right: 25, 
        bottom: 25 
    },
});
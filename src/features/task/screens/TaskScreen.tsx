// src/features/task/screens/TaskScreen.tsx

import React, { useState, useCallback, useEffect } from "react"; // Adicionar React e useEffect
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native"; // Remover Alert
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
// Remover NewItemButton, pois tarefas são criadas no contexto do projeto
// import { NewItemButton } from "../../../components/common/NewItemButton";
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'; // Adicionar useFocusEffect
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, RootTabParamList } from "../../../types/navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAppContext } from "../../../contexts/AppContext";
import { Task } from "../../../types/entities"; // Usar tipo Task
import { TaskCard } from "../components/TaskCard";
import { FilterModal, Filters } from "../components/FilterModal";
import { FilterButton } from "../components/FilterButton";
import { useTasks } from "../hooks/useTasks"; // Importar o novo hook useTasks

// Remover MOCK_TASKS
// import { MOCK_TASKS } from "../../../data/mocks";

const polvo_tasks = require('../../../assets/polvo_tasks.png');

type TaskScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Tarefas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TaskScreen = ({ navigation }: TaskScreenNavigationProp) => {
    const { signed, user } = useAppContext(); // Obter usuário do contexto

    // Usar o hook useTasks para gerenciar os dados das tarefas
    const {
        tasks,
        loadingTasks,
        refreshingTasks,
        hasMoreTasks,
        loadMoreTasks,
        refreshTasks,
        applyFilters,
        clearFilters,
        searchByTitle,
    } = useTasks(signed);

    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    // Remover estado local de filtros, pois é gerenciado pelo hook useTasks
    // const [filters, setFilters] = useState<Filters>({});

    // Usar dados do usuário do contexto para o Header
    const userProfileForHeader = user ? { initials: user.initials } : { initials: '?' };

    const handleProfilePress = () => navigation.navigate('EditProfile');
    const handleNotificationsPress = () => { /* Lógica futura para notificações */ };

    // Remover handleNewTask, pois o botão foi removido
    // const handleNewTask = () => { ... };

    // Handler para aplicar filtros (chama a função do hook)
    const handleApplyFilters = (newFilters: Filters) => {
        applyFilters(newFilters);
        setFilterModalVisible(false);
    };

    // Handler para limpar filtros (chama a função do hook)
    const handleClearFilters = () => {
        clearFilters();
        setSearch(''); // Limpa também a busca
        setFilterModalVisible(false);
    };

    // Debounce para a busca (similar a ProjectScreen/TeamScreen)
    useEffect(() => {
      const handler = setTimeout(() => {
        searchByTitle(search);
      }, 500); // Aguarda 500ms após o usuário parar de digitar

      return () => {
        clearTimeout(handler); // Limpa o timeout se o usuário digitar novamente
      };
    }, [search, searchByTitle]);

    // Recarrega as tarefas quando a tela recebe foco
    useFocusEffect(
      useCallback(() => {
        if (signed) {
          refreshTasks(); // Chama a função de refresh do hook
        }
      }, [signed, refreshTasks]) // Adiciona refreshTasks às dependências
    );

    // Handler para carregar mais tarefas (infinite scroll)
    const handleEndReached = useCallback(() => {
        // Verifica se há mais tarefas, se não está carregando/refrescando e se já há tarefas na lista
        if (hasMoreTasks && !loadingTasks && !refreshingTasks && tasks.length > 0) {
            loadMoreTasks(); // Chama a função do hook
        }
    }, [hasMoreTasks, loadingTasks, refreshingTasks, tasks.length, loadMoreTasks]); // Adiciona dependências corretas

    // O useMemo para filteredTasks não é mais necessário, pois o hook useTasks já retorna as tarefas filtradas

    return (
        <SafeAreaView style={styles.safeAreaView} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userProfileForHeader} // Passa o perfil do usuário do contexto
                onPressProfile={handleProfilePress}
                notificationCount={0} // Manter como 0 por enquanto
                onPressNotifications={handleNotificationsPress}
            />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar
                        title="Suas tarefas"
                        placeholder="Pesquisar Tarefas"
                        onChangeText={setSearch}
                        value={search} // Controla o valor da barra de busca
                    />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>
            <FlatList
                data={tasks} // Usa as tarefas diretamente do hook useTasks
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        // Navega para TaskDetail, passando projectId e taskId
                        onPress={() => navigation.navigate('TaskDetail', { projectId: item.projectId, taskId: item.id })}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    // Mostra EmptyState apenas se não estiver carregando e não houver tarefas
                    (loadingTasks || refreshingTasks) ? null : (
                        <EmptyState
                            imageSource={polvo_tasks}
                            title="Nenhuma tarefa por aqui!"
                            subtitle="Crie tarefas dentro de um projeto ou verifique seus filtros."
                        />
                    )
                }
                // Configurações para pull-to-refresh e infinite scroll
                onRefresh={refreshTasks} // Handler para pull-to-refresh
                refreshing={refreshingTasks} // Estado de loading do refresh
                onEndReached={handleEndReached} // Handler para chegar ao fim da lista
                onEndReachedThreshold={0.5} // Define quão perto do fim aciona onEndReached
                ListFooterComponent={() => {
                    // Mostra indicador de loading no final da lista se estiver carregando mais itens
                    if (loadingTasks && !refreshingTasks) {
                        return (
                            <View style={styles.loadingFooter}>
                                <ActivityIndicator size="large" color="#EB5F1C" />
                            </View>
                        );
                    }
                    return null;
                }}
            />
            {/* Remover o botão de adicionar nova tarefa */}
            {/* <View style={styles.addButtonContainer}><NewItemButton onPress={handleNewTask} /></View> */}

            <FilterModal
                visible={isFilterModalVisible}
                filterType="tasks" // Define o tipo de filtro para tarefas
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters} // Usa o handler atualizado
                onClear={handleClearFilters} // Usa o handler atualizado
            />
        </SafeAreaView>
    );
};

// Ajustar estilos se necessário (manter a maioria dos estilos existentes)
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
        marginTop: 75 // Ajuste conforme necessário para alinhar com a SearchBar
    },
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 15,
        paddingBottom: 20 // Reduzir padding se o botão de adicionar foi removido
    },
    // Remover addButtonContainer se o botão foi removido
    /*
    addButtonContainer: {
        position: 'absolute',
        right: 25,
        bottom: 25
    },
    */
    loadingFooter: { // Estilo para o indicador de loading no final da lista
        padding: 20,
        alignItems: 'center',
    },
});
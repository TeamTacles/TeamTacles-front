import React, { useState, useCallback, useEffect } from "react"; 
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native"; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, RootTabParamList } from "../../../types/Navigation";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAppContext } from "../../../contexts/AppContext";
import { Task } from "../../../types/entities"; 
import { TaskCard } from "../components/TaskCard";
import { FilterModal, Filters } from "../components/FilterModal";
import { FilterButton } from "../components/FilterButton";
import { useTasks } from "../hooks/useTasks"; 


const polvo_tasks = require('../../../assets/polvo_tasks.png');

type TaskScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Tarefas'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const TaskScreen = ({ navigation }: TaskScreenNavigationProp) => {
    const { signed, user } = useAppContext(); 

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
    const userProfileForHeader = user ? { initials: user.initials } : { initials: '?' };

    const handleProfilePress = () => navigation.navigate('EditProfile');
    const handleNotificationsPress = () => { /* Lógica futura para notificações */ };

 

    const handleApplyFilters = (newFilters: Filters) => {
        applyFilters(newFilters);
        setFilterModalVisible(false);
    };

    const handleClearFilters = () => {
        clearFilters();
        setSearch(''); 
    };

    useEffect(() => {
      const handler = setTimeout(() => {
        searchByTitle(search);
      }, 500); 

      return () => {
        clearTimeout(handler); 
      };
    }, [search, searchByTitle]);

    useFocusEffect(
      useCallback(() => {
        if (signed) {
          refreshTasks(); 
        }
      }, [signed, refreshTasks]) 
    );

    const handleEndReached = useCallback(() => {
        if (hasMoreTasks && !loadingTasks && !refreshingTasks && tasks.length > 0) {
            loadMoreTasks(); 
        }
    }, [hasMoreTasks, loadingTasks, refreshingTasks, tasks.length, loadMoreTasks]); 

   

    return (
        <SafeAreaView style={styles.safeAreaView} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userProfileForHeader} 
                onPressProfile={handleProfilePress}
                notificationCount={0} 
                onPressNotifications={handleNotificationsPress}
            />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar
                        title="Suas tarefas"
                        placeholder="Pesquisar Tarefas"
                        onChangeText={setSearch}
                        value={search} 
                    />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>
            <FlatList
                data={tasks} 
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onPress={() => navigation.navigate('TaskDetail', { projectId: item.projectId, taskId: item.id })}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    (loadingTasks || refreshingTasks) ? null : (
                        <EmptyState
                            imageSource={polvo_tasks}
                            title="Nenhuma tarefa por aqui!"
                            subtitle="Crie tarefas dentro de um projeto ou verifique seus filtros."
                        />
                    )
                }
                onRefresh={refreshTasks} 
                refreshing={refreshingTasks} 
                onEndReached={handleEndReached} 
                onEndReachedThreshold={0.5} 
                ListFooterComponent={() => {
                    
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
        paddingBottom: 20 
    },
   
    loadingFooter: { 
        padding: 20,
        alignItems: 'center',
    },
});
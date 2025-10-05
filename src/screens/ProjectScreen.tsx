import React, { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../types/Navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState } from '../components/EmptyState';
import { useAppContext } from "../contexts/AppContext"; 
import { FilterModal, Filters } from "../components/FilterModal";
import { FilterButton } from "../components/FilterButton";

const polvo_pescando = require('../assets/polvo_pescando.png');

type ProjectScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    const { projects } = useAppContext(); 
    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});

    const userWithAvatar = { initials: 'CD' };

    const handleProfilePress = () => Alert.alert("Perfil Clicado!");
    const handleNotificationsPress = () => Alert.alert("Notificações Clicadas!");
    const handleNewProject = () => navigation.navigate('ProjectForm'); 
    
    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setFilterModalVisible(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        setFilterModalVisible(false);
    };

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
            .filter(p => {
                const projectDate = new Date(p.createdAt);
                if (filters.createdAtAfter && projectDate < filters.createdAtAfter) return false;
                if (filters.createdAtBefore && projectDate > filters.createdAtBefore) return false;
                return true;
            });
    }, [search, projects, filters]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar title="Seus Territórios" placeholder="Pesquisar Projetos" onChangeText={setSearch} />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>
            <FlatList
                data={filteredProjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProjectCard
                        project={item} 
                        onPress={() => Alert.alert('Navegar para', item.title)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <EmptyState
                        imageSource={polvo_pescando}
                        title="Nenhum Projeto Encontrado"
                        subtitle="Clique em + para adicionar um novo projeto."
                    />
                }
            />
            <View style={styles.addButtonContainer}>
                <NewItemButton
                    onPress={handleNewProject}
                />
            </View>
            <FilterModal
                visible={isFilterModalVisible}
                filterType="projects"
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#191919' 
    },
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        paddingRight: 15 }
        ,
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
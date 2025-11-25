import { useState, useRef, useCallback, useEffect } from "react";
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
import { NewItemButton } from "../../../components/common/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../../../types/Navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState } from '../../../components/common/EmptyState';
import { useAppContext } from "../../../contexts/AppContext"; 
import { useProjects } from "../hooks/useProjects"; 
import { FilterModal, Filters } from "../../task/components/FilterModal"; 
import { FilterButton } from "../../task/components/FilterButton"; 
import { NewProjectModal } from "../components/NewProjectModal"; 
import { AddMembersModal } from "../components/AddMembersModal"; 
import NotificationPopup from '../../../components/common/NotificationPopup'; 
import { InfoPopup } from "../../../components/common/InfoPopup"; 
import { useProjectScreen } from "../hooks/useProjectScreen"; 
import { useTeams } from '../../team/hooks/useTeams'; 
import { JoinProjectModal } from '../components/JoinProjectModal';
import Icon from 'react-native-vector-icons/Ionicons'; 

const polvo_bau = require('../../../assets/polvo_bau.png'); 

type ProjectScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    const { signed, user } = useAppContext(); 

    const {
        projects,
        addProject,
        loadMoreProjects,
        refreshProjects,
        initialLoading, 
        loadingProjects, 
        refreshingProjects: refreshingProjectList, 
        hasMoreProjects,
        applyFilters,
        clearFilters,
        searchByTitle,
    } = useProjects(signed); 

    const {
        teams: userTeamsList,
        loadingTeams: loadingUserTeams,
        refreshingTeams,
        refreshTeams,
    } = useTeams(signed); 

    const {
        isNewProjectModalVisible,
        isAddMembersModalVisible,
        newlyCreatedProject,
        isCreatingProject,
        isInvitingMember,
        isImporting,
        notificationRef,
        modalNotificationRef,
        infoPopup,
        setInfoPopup,
        setNewProjectModalVisible,
        handleCreateProjectAndProceed,
        handleInviteMemberToProject,
        handleImportTeamToProject,
        handleCloseAddMembersModal,
    } = useProjectScreen({ addProject }); 

    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isJoinModalVisible, setJoinModalVisible] = useState(false);

    const userProfileForHeader = user ? { initials: user.initials, name: user.name } : { initials: '?', name: ''}; 

    const handleProfilePress = () => navigation.navigate('EditProfile');
    const handleNotificationsPress = () => {};
    const handleNewProject = () => setNewProjectModalVisible(true); 
    const handleApplyFilters = (newFilters: Filters) => {
        applyFilters(newFilters); 
        setFilterModalVisible(false);
    };
    const handleClearFilters = () => {
        clearFilters(); 
        setSearch('');
        setFilterModalVisible(false);
    };

    const handleCloseModalAndRefreshProjects = () => {
        handleCloseAddMembersModal();
        refreshProjects(); 
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            searchByTitle(search); 
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search, searchByTitle]); 

    const handleEndReached = useCallback(() => {
        if (hasMoreProjects && !loadingProjects && !refreshingProjectList && projects.length > 0) { 
            loadMoreProjects(); 
        }
    }, [hasMoreProjects, loadingProjects, refreshingProjectList, projects.length, loadMoreProjects]); 


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header
                userProfile={userProfileForHeader} 
                onPressProfile={handleProfilePress}
                notificationCount={0} 
                onPressNotifications={handleNotificationsPress}
            />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar
                        title="Seus Projetos"
                        placeholder="Pesquisar por título..."
                        onChangeText={setSearch}
                        value={search}
                    />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>

            <TouchableOpacity 
                style={styles.joinButtonContainer} 
                onPress={() => setJoinModalVisible(true)}
            >
                <Icon name="enter-outline" size={20} color="#EB5F1C" />
                <Text style={styles.joinButtonText}>Entrar com código</Text>
            </TouchableOpacity>

            {initialLoading ? (
                <View style={styles.centeredLoading}>
                    <ActivityIndicator size="large" color="#EB5F1C" />
                    <Text style={styles.loadingText}>Carregando projetos...</Text>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) =>
                        <ProjectCard
                            project={item}
                            onPress={() => navigation.navigate('ProjectDetail', { 
                                projectId: item.id,
                                projectTitle: item.title,
                                projectRole: item.projectRole || 'MEMBER'
                            })}
                        /> 
                    }
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <EmptyState
                            imageSource={polvo_bau} 
                            title="Nenhum Projeto Encontrado"
                            subtitle="Clique em + para adicionar um novo projeto."
                        /> 
                    }
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    onRefresh={refreshProjects} 
                    refreshing={refreshingProjectList} 
                    ListFooterComponent={() => {
                        if (loadingProjects) { 
                            return ( <View style={styles.loadingFooter}><ActivityIndicator size="large" color="#EB5F1C" /></View> );
                        }
                        return null;
                    }}
                />
            )}

            <View style={styles.addButtonContainer}>
                <NewItemButton onPress={handleNewProject} />
            </View>

            <FilterModal
                visible={isFilterModalVisible}
                filterType="projects"
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
            />
            <NewProjectModal
                visible={isNewProjectModalVisible} 
                onClose={() => setNewProjectModalVisible(false)} 
                onCreate={handleCreateProjectAndProceed} 
                isCreating={isCreatingProject} 
            />
            <AddMembersModal
                visible={isAddMembersModalVisible} 
                onClose={handleCloseModalAndRefreshProjects} 
                onInviteByEmail={handleInviteMemberToProject} 
                onImportTeam={handleImportTeamToProject} 
                userTeams={userTeamsList} 
                notificationRef={modalNotificationRef} 
                projectId={newlyCreatedProject?.id} 
                isInviting={isInvitingMember} 
                isImporting={isImporting} 
                onRefreshTeams={refreshTeams} 
                isRefreshingTeams={refreshingTeams} 
            />
            <JoinProjectModal 
                visible={isJoinModalVisible}
                onClose={() => setJoinModalVisible(false)}
                onSuccess={() => refreshProjects()} 
            />
            <NotificationPopup ref={notificationRef} />

            <InfoPopup
                visible={infoPopup.visible} 
                title={infoPopup.title} 
                message={infoPopup.message} 
                onClose={() => setInfoPopup({ visible: false, title: '', message: '' })} 
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#191919' },
    searchContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 15 },
    searchBarWrapper: { flex: 1 },
    filterButtonPosition: { marginTop: 75 },
    listContainer: { flexGrow: 1, paddingHorizontal: 15, paddingBottom: 80 },
    addButtonContainer: { position: 'absolute', right: 25, bottom: 25 },
    loadingFooter: { padding: 20, alignItems: 'center' },
    centeredLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#888', marginTop: 10, fontSize: 14 },
    
    loadMoreButton: {
        backgroundColor: '#EB5F1C',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    loadMoreText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    joinButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A2A2A', 
        paddingVertical: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3C3C3C',
    },
    joinButtonText: {
        color: '#EB5F1C', 
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
});
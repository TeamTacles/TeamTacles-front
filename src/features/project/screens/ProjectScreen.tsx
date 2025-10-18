import { useState, useMemo, useRef, useCallback } from "react";
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
import { NewItemButton } from "../../../components/common/NewItemButton";
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../../../types/navigation";
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
import { TeamType } from '../../../types/entities';
import { MOCK_USER_TEAMS } from '../../../data/mocks';
import { useProjectScreen } from "../hooks/useProjectScreen";

const polvo_pescando = require('../../../assets/polvo_pescando.png');

type ProjectScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    const { signed } = useAppContext();
    const {
        projects,
        addProject,
        loadMoreProjects,
        refreshProjects,
        loadingProjects,
        refreshingProjects,
        hasMoreProjects
    } = useProjects(signed);

    // Hook customizado que gerencia a lógica da tela de projetos
    const {
        isNewProjectModalVisible,
        isAddMembersModalVisible,
        newlyCreatedProject,
        isCreatingProject,
        isInvitingMember,
        notificationRef,
        modalNotificationRef,
        setNewProjectModalVisible,
        handleCreateProjectAndProceed,
        handleInviteMemberToProject,
        handleImportTeamToProject,
        handleCloseAddMembersModal,
    } = useProjectScreen({ addProject });

    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});
    const [userTeams] = useState<TeamType[]>(MOCK_USER_TEAMS);

    const userWithAvatar = { initials: 'CD', name: 'Caio Dib' };

    const handleProfilePress = () => {};
    const handleNotificationsPress = () => {};
    const handleNewProject = () => setNewProjectModalVisible(true);
    const handleApplyFilters = (newFilters: Filters) => {};
    const handleClearFilters = () => {};
    
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    }, [search, projects]);

    // Handler para onEndReached com proteção contra chamadas durante refresh
    const handleEndReached = useCallback(() => {
        // Só carrega mais se há projetos disponíveis, não está carregando,
        // não está fazendo refresh, e já tem projetos carregados (evita race condition na inicialização)
        if (hasMoreProjects && !loadingProjects && !refreshingProjects && projects.length > 0) {
            loadMoreProjects();
        }
    }, [hasMoreProjects, loadingProjects, refreshingProjects, projects.length, loadMoreProjects]);

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
                ListEmptyComponent={<EmptyState imageSource={polvo_pescando} title="Nenhum Projeto Encontrado" subtitle="Clique em + para adicionar um novo projeto." />}

                // Infinite Scroll
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}

                // Pull-to-refresh
                onRefresh={refreshProjects}
                refreshing={refreshingProjects}

                // Loading indicator no fim da lista
                ListFooterComponent={() => {
                    if (loadingProjects) {
                        return (
                            <View style={styles.loadingFooter}>
                                <ActivityIndicator size="large" color="#EB5F1C" />
                            </View>
                        );
                    }

                    // Mostra botão "Carregar Mais" se houver mais projetos (útil para web/desktop)
                    if (hasMoreProjects && projects.length > 0) {
                        return (
                            <View style={styles.loadingFooter}>
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={loadMoreProjects}
                                >
                                    <Text style={styles.loadMoreText}>Carregar Mais</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    return null;
                }}
            />

            <View style={styles.addButtonContainer}>
                <NewItemButton onPress={handleNewProject} />
            </View>

            <FilterModal visible={isFilterModalVisible} filterType="projects" onClose={() => setFilterModalVisible(false)} onApply={handleApplyFilters} onClear={handleClearFilters} />
            <NewProjectModal
                visible={isNewProjectModalVisible}
                onClose={() => setNewProjectModalVisible(false)}
                onCreate={handleCreateProjectAndProceed}
                isCreating={isCreatingProject}
            />
            <AddMembersModal
                visible={isAddMembersModalVisible}
                onClose={handleCloseAddMembersModal}
                onInviteByEmail={handleInviteMemberToProject}
                onImportTeam={handleImportTeamToProject}
                userTeams={userTeams}
                inviteLink={newlyCreatedProject ? `/api/project/join?token=${newlyCreatedProject.id}`: null}
                notificationRef={modalNotificationRef}
                projectId={newlyCreatedProject?.id}
                isInviting={isInvitingMember}
            />
            <NotificationPopup ref={notificationRef} />
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
});
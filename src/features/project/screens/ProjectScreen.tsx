// src/features/project/screens/ProjectScreen.tsx
import { useState, useRef, useCallback, useEffect } from "react";
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
import { NewItemButton } from "../../../components/common/NewItemButton";
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../../../types/navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState } from '../../../components/common/EmptyState';
import { useAppContext } from "../../../contexts/AppContext"; // Importar useAppContext
import { useProjects } from "../hooks/useProjects"; //
import { FilterModal, Filters } from "../../task/components/FilterModal"; //
import { FilterButton } from "../../task/components/FilterButton"; //
import { NewProjectModal } from "../components/NewProjectModal"; //
import { AddMembersModal } from "../components/AddMembersModal"; //
import NotificationPopup from '../../../components/common/NotificationPopup'; //
import { InfoPopup } from "../../../components/common/InfoPopup"; //
// Remover importação não utilizada de TeamType
import { useProjectScreen } from "../hooks/useProjectScreen"; //
import { useTeams } from '../../team/hooks/useTeams'; //

const polvo_pescando = require('../../../assets/polvo_pescando.png'); //

type ProjectScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Projetos'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProjectScreen = ({ navigation }: ProjectScreenNavigationProp) => {
    // --- INÍCIO DA ALTERAÇÃO: Obter usuário do contexto ---
    const { signed, user } = useAppContext(); //
    // --- FIM DA ALTERAÇÃO ---

    const {
        projects,
        addProject,
        loadMoreProjects,
        refreshProjects,
        loadingProjects,
        refreshingProjects: refreshingProjectList,
        hasMoreProjects,
        applyFilters,
        clearFilters,
        searchByTitle,
    } = useProjects(signed); //

    const {
        teams: userTeamsList,
        loadingTeams: loadingUserTeams,
        refreshingTeams,
        refreshTeams,
    } = useTeams(signed); //

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
    } = useProjectScreen({ addProject }); //

    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    // --- INÍCELULA DA ALTERAÇÃO: Usar usuário real se disponível ---
    // Cria um objeto para o header, usando dados do 'user' do contexto ou um fallback.
    const userProfileForHeader = user ? { initials: user.initials, name: user.name } : { initials: '?', name: ''}; //
    // --- FIM DA ALTERAÇÃO ---

    const handleProfilePress = () => navigation.navigate('EditProfile');
    const handleNotificationsPress = () => {};
    const handleNewProject = () => setNewProjectModalVisible(true); //
    const handleApplyFilters = (newFilters: Filters) => {
        applyFilters(newFilters); //
        setFilterModalVisible(false);
    };
    const handleClearFilters = () => {
        clearFilters(); //
        setSearch('');
        setFilterModalVisible(false);
    };

    // --- INÍCIO DA CORREÇÃO ---
    /**
     * Fecha o modal de adicionar membros E atualiza a lista de projetos
     * para exibir os membros recém-importados no card.
     */
    const handleCloseModalAndRefreshProjects = () => {
        handleCloseAddMembersModal(); // 1. Chama a função original para limpar o estado do modal
        refreshProjects(); // 2. Chama a função para recarregar a lista de projetos
    };
    // --- FIM DA CORREÇÃO ---

    // Adicionar useEffect para debounce da busca
    useEffect(() => {
        const handler = setTimeout(() => {
            searchByTitle(search); //
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search, searchByTitle]); //

    // Recarregar ao focar na tela
    useFocusEffect(
      useCallback(() => {
        if (signed) { //
          refreshProjects(); //
        }
      }, [signed, refreshProjects]) //
    );

    // Handler de fim de lista
    const handleEndReached = useCallback(() => {
        if (hasMoreProjects && !loadingProjects && !refreshingProjectList && projects.length > 0) { //
            loadMoreProjects(); //
        }
    }, [hasMoreProjects, loadingProjects, refreshingProjectList, projects.length, loadMoreProjects]); //

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Header
                // --- INÍCIO DA ALTERAÇÃO: Passar perfil real ---
                userProfile={userProfileForHeader} // Passa o objeto criado com dados do usuário
                // --- FIM DA ALTERAÇÃO ---
                onPressProfile={handleProfilePress}
                notificationCount={0} // Manter mock ou buscar real
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

            <FlatList
                data={projects} //
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) =>
                    <ProjectCard
                        project={item}
                        onPress={() => navigation.navigate('ProjectDetail', { //
                            projectId: item.id,
                            projectTitle: item.title,
                            projectRole: item.projectRole || 'MEMBER'
                        })}
                    /> //
                }
                contentContainerStyle={styles.listContainer}
                 ListEmptyComponent={
                    (loadingProjects || refreshingProjectList) ? null : ( //
                        <EmptyState
                            imageSource={polvo_pescando} //
                            title="Nenhum Projeto Encontrado"
                            subtitle="Clique em + para adicionar um novo projeto."
                        /> //
                    )
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                onRefresh={refreshProjects} //
                refreshing={refreshingProjectList} //
                ListFooterComponent={() => {
                    if (loadingProjects && !refreshingProjectList) { //
                        return ( <View style={styles.loadingFooter}><ActivityIndicator size="large" color="#EB5F1C" /></View> );
                    }
                    return null;
                }}
            />

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
                visible={isNewProjectModalVisible} //
                onClose={() => setNewProjectModalVisible(false)} //
                onCreate={handleCreateProjectAndProceed} //
                isCreating={isCreatingProject} //
            />
            <AddMembersModal
                visible={isAddMembersModalVisible} //
                onClose={handleCloseModalAndRefreshProjects} // <-- USAR A NOVA FUNÇÃO AQUI
                onInviteByEmail={handleInviteMemberToProject} //
                onImportTeam={handleImportTeamToProject} //
                userTeams={userTeamsList} //
                notificationRef={modalNotificationRef} //
                projectId={newlyCreatedProject?.id} //
                isInviting={isInvitingMember} //
                isImporting={isImporting} //
                onRefreshTeams={refreshTeams} //
                isRefreshingTeams={refreshingTeams} //
            />
            <NotificationPopup ref={notificationRef} />

            <InfoPopup
                visible={infoPopup.visible} //
                title={infoPopup.title} //
                message={infoPopup.message} //
                onClose={() => setInfoPopup({ visible: false, title: '', message: '' })} //
             />
        </SafeAreaView>
    );
};

// Estilos permanecem os mesmos...
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
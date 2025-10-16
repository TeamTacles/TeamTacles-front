import { useState, useMemo, useRef, useCallback } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from "react-native";
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
import { useProjects } from "../hooks/useProjects";
import { FilterModal, Filters } from "../components/FilterModal";
import { FilterButton } from "../components/FilterButton";
import { NewProjectModal } from "../components/NewProjectModal";
import { AddMembersModal } from "../components/AddMembersModal";
import { TeamType, Member } from "../components/TeamCard";
import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';
import { projectService } from "../services/projectService";
import { getInviteErrorMessage } from "../utils/errorHandler";

const polvo_pescando = require('../assets/polvo_pescando.png');

const MOCK_TEAMS: TeamType[] = [
    { id: '1', title: 'Frontend Warriors', description: '', members: [{name: 'Caio Dib', initials: 'CD'}, {name: 'João Victor', initials: 'JV'}, {name: 'Ana Mello', initials: 'AM'}], createdAt: new Date() },
    { id: '2', title: 'Backend Legends', description: '', members: [{name: 'Pedro Ramos', initials: 'PR'}, {name: 'Sofia Costa', initials: 'SC'}], createdAt: new Date() },
];

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
    const notificationRef = useRef<NotificationPopupRef>(null);
    const modalNotificationRef = useRef<NotificationPopupRef>(null);

    const [search, setSearch] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});
    const [isNewProjectModalVisible, setNewProjectModalVisible] = useState(false);
    const [isAddMembersModalVisible, setAddMembersModalVisible] = useState(false);
    const [newlyCreatedProject, setNewlyCreatedProject] = useState<any | null>(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [userTeams] = useState<TeamType[]>(MOCK_TEAMS);
    
    // ALTERAÇÃO: Fila para armazenar as mensagens de notificação
    const [notificationQueue, setNotificationQueue] = useState<string[]>([]);

    const userWithAvatar = { initials: 'CD', name: 'Caio Dib' };

    const handleProfilePress = () => {};
    const handleNotificationsPress = () => {};
    const handleNewProject = () => setNewProjectModalVisible(true);
    const handleApplyFilters = (newFilters: Filters) => {};
    const handleClearFilters = () => {};

    const handleCreateProjectAndProceed = async (data: { title: string; description: string }) => {
        if (!data.title.trim()) {
            notificationRef.current?.show({ type: 'error', message: 'O título do projeto é obrigatório.' });
            return;
        }
        setIsCreatingProject(true);
        try {
            // Chama a API para criar o projeto
            const createdProject = await addProject({
                title: data.title,
                description: data.description,
            });

            // Armazena o projeto recém-criado com o ID para usar nos convites
            setNewlyCreatedProject(createdProject);
            setNotificationQueue(prev => [`Projeto "${data.title}" criado!`, ...prev]);
            setNewProjectModalVisible(false);
            setAddMembersModalVisible(true);
        } catch (error: any) {
            const errorMessage = error.message || 'Não foi possível criar o projeto.';
            notificationRef.current?.show({ type: 'error', message: errorMessage });
        } finally {
            setIsCreatingProject(false);
        }
    };

    const handleInviteMemberToProject = async (email: string, role: 'ADMIN' | 'MEMBER') => {
        if (!newlyCreatedProject) {
            modalNotificationRef.current?.show({ type: 'error', message: 'Projeto não encontrado.' });
            return;
        }

        try {
            await projectService.inviteUserByEmail(newlyCreatedProject.id, { email, role });
            // Exibe notificação de sucesso imediatamente dentro do modal
            modalNotificationRef.current?.show({ type: 'success', message: `Convite enviado com sucesso!` });
        } catch (error) {
            // Exibe erro imediatamente dentro do modal (usa modalNotificationRef)
            const errorMessage = getInviteErrorMessage(error);
            modalNotificationRef.current?.show({ type: 'error', message: errorMessage });
        }
    };

    const handleImportTeamToProject = (teamId: string) => {
        // TODO: Implementar importação de time quando o endpoint estiver disponível
        // await projectService.importTeam(newlyCreatedProject.id, teamId);
        setNotificationQueue(prev => [...prev, 'Membros importados com sucesso!']);
    };

    // ALTERAÇÃO: Nova função para processar a fila de notificações
    const processNotificationQueue = () => {
        if (notificationQueue.length === 0) return;

        // Pega a primeira mensagem da fila
        const message = notificationQueue[0];
        notificationRef.current?.show({ type: 'success', message });

        // Remove a mensagem que acabou de ser exibida
        const newQueue = notificationQueue.slice(1);
        setNotificationQueue(newQueue);

        // Se ainda houver mensagens, chama a função novamente após 3 segundos
        if (newQueue.length > 0) {
            setTimeout(processNotificationQueue, 3000); // 3s de intervalo para a próxima
        }
    };

    const handleCloseAddMembersModal = () => {
        setAddMembersModalVisible(false);
        // ALTERAÇÃO: Inicia o processamento da fila SÓ QUANDO o modal for fechado
        if (notificationQueue.length > 0) {
            setTimeout(processNotificationQueue, 500); // Um pequeno atraso inicial para a animação de fechar o modal
        }
        setNewlyCreatedProject(null);
    };
    
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
                        onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id, projectTitle: item.title })}
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
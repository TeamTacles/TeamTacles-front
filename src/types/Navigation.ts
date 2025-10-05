import { TeamType } from '../components/TeamCard';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Menu: undefined;
    ProjectForm: undefined;
    TaskForm: undefined;
    EditProfile: undefined;
    TeamDetail: { team: TeamType };
};

export type RootTabParamList = {
    Projetos: undefined;
    Tarefas: undefined;
    Equipes: undefined;
    Mais: undefined;
};

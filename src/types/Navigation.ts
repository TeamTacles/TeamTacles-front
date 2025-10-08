import { TeamType } from '../components/TeamCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
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
export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;


import { TeamType } from './entities';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProjectTask } from '../features/project/services/projectService';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Menu: undefined;
    ProjectForm: undefined;
    TaskForm: undefined;
    EditProfile: undefined;
    TeamDetail: { team: TeamType };
    ProjectDetail: { projectId: number; projectTitle: string; projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' };
    ReportCenter: { projectId: number };
    TaskDetail: {
        projectId: number;
        taskId: number;
        projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
        onTaskUpdate?: (taskId: number, updates: Partial<ProjectTask>) => void;
        onTaskDelete?: (taskId: number) => void;
    };
 
};

export type RootTabParamList = {
    Projetos: undefined;
    Tarefas: undefined;
    Equipes: undefined;
    Mais: undefined;
};
export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
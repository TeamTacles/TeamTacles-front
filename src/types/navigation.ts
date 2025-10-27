// src/types/navigation.ts
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
    // --- CORREÇÃO AQUI ---
    TaskDetail: {
        projectId: number;
        taskId: number;
        projectRole: 'OWNER' | 'ADMIN' | 'MEMBER'; // Adicionar projectRole
        onTaskUpdate?: (taskId: number, updates: Partial<ProjectTask>) => void; // Callback para atualização otimista
        onTaskDelete?: (taskId: number) => void; // Callback para remoção otimista
    };
    // --- FIM DA CORREÇÃO ---
};

export type RootTabParamList = {
    Projetos: undefined;
    Tarefas: undefined;
    Equipes: undefined;
    Mais: undefined;
};
export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Menu: undefined;
    ProjectForm: {
        onAddProject: (newProject: any) => void; 
    };
    TaskForm: undefined;
};

export type RootTabParamList = {
    Projetos: undefined;
    Tarefas: undefined;
    Equipe: undefined;
    Configurações: undefined;
};

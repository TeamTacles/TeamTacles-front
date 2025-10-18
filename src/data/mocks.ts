// src/data/mocks.ts
// Dados mocados centralizados para desenvolvimento e testes

import { Team, Member, Task } from '../types/entities';
import { ProjectMember, ProjectTask } from '../features/project/services/projectService';

/**
 * Times mocados para a tela de Times
 */
export const MOCK_TEAMS: Team[] = [
    {
        id: '1',
        title: 'Frontend Warriors',
        description: 'Essa equipe é fera demais no desenvolvimento de interfaces incríveis e performáticas para o usuário final.',
        members: [
            { name: 'Caio Dib', initials: 'CD' },
            { name: 'João Victor', initials: 'JV' },
            { name: 'Ana Mello', initials: 'AM' },
            { name: 'Túlio Santos', initials: 'TS' },
            { name: 'Luana Marques', initials: 'LM' }
        ],
        createdAt: new Date('2025-08-15T10:00:00Z'),
    },
    {
        id: '2',
        title: 'Backend Legends',
        description: 'Responsáveis pela robustez e segurança dos nossos sistemas.',
        members: [
            { name: 'Pedro Ramos', initials: 'PR' },
            { name: 'Sofia Costa', initials: 'SC' },
            { name: 'Felipe Garcia', initials: 'FG' }
        ],
        createdAt: new Date('2025-09-20T11:30:00Z'),
    },
    {
        id: '3',
        title: 'UX/UI Visionaries',
        description: '',
        members: [
            { name: 'Mariana Costa', initials: 'MC' },
            { name: 'Daniel Almeida', initials: 'DA' }
        ],
        createdAt: new Date('2025-10-01T15:00:00Z'),
    }
];

/**
 * Times simplificados para a tela de Projetos
 */
export const MOCK_USER_TEAMS: Team[] = [
    {
        id: '1',
        title: 'Frontend Warriors',
        description: '',
        members: [
            { name: 'Caio Dib', initials: 'CD' },
            { name: 'João Victor', initials: 'JV' },
            { name: 'Ana Mello', initials: 'AM' }
        ],
        createdAt: new Date()
    },
    {
        id: '2',
        title: 'Backend Legends',
        description: '',
        members: [
            { name: 'Pedro Ramos', initials: 'PR' },
            { name: 'Sofia Costa', initials: 'SC' }
        ],
        createdAt: new Date()
    },
];

/**
 * Membros mocados para os detalhes do projeto
 */
export const MOCK_MEMBERS: ProjectMember[] = [
    { userId: 1001, username: 'Mock 1', email: 'mock1@email.com', projectRole: 'MEMBER' },
    { userId: 1002, username: 'Mock 2', email: 'mock2@email.com', projectRole: 'MEMBER' },
    { userId: 1003, username: 'Mock 3', email: 'mock3@email.com', projectRole: 'MEMBER' },
    { userId: 1004, username: 'Mock 4', email: 'mock4@email.com', projectRole: 'MEMBER' },
    { userId: 1005, username: 'Mock 5', email: 'mock5@email.com', projectRole: 'MEMBER' },
    { userId: 1006, username: 'Mock 6', email: 'mock6@email.com', projectRole: 'MEMBER' },
    { userId: 1007, username: 'Mock 7', email: 'mock7@email.com', projectRole: 'MEMBER' },
    { userId: 1008, username: 'Mock 8', email: 'mock8@email.com', projectRole: 'MEMBER' },
    { userId: 1009, username: 'Mock 9', email: 'mock9@email.com', projectRole: 'MEMBER' },
    { userId: 1010, username: 'Mock 10', email: 'mock10@email.com', projectRole: 'MEMBER' },
    { userId: 1011, username: 'Mock 11', email: 'mock11@email.com', projectRole: 'MEMBER' },
    { userId: 1012, username: 'Mock 12', email: 'mock12@email.com', projectRole: 'MEMBER' },
    { userId: 1013, username: 'Mock 13', email: 'mock13@email.com', projectRole: 'MEMBER' },
    { userId: 1014, username: 'Mock 14', email: 'mock14@email.com', projectRole: 'MEMBER' },
    { userId: 1015, username: 'Mock 15', email: 'mock15@email.com', projectRole: 'MEMBER' },
    { userId: 1016, username: 'Mock 16', email: 'mock16@email.com', projectRole: 'MEMBER' },
    { userId: 1017, username: 'Mock 17', email: 'mock17@email.com', projectRole: 'MEMBER' },
    { userId: 1018, username: 'Mock 18', email: 'mock18@email.com', projectRole: 'MEMBER' },
    { userId: 1019, username: 'Mock 19', email: 'mock19@email.com', projectRole: 'MEMBER' },
    { userId: 1020, username: 'Mock 20', email: 'mock20@email.com', projectRole: 'MEMBER' },
    { userId: 1021, username: 'Mock 21', email: 'mock21@email.com', projectRole: 'MEMBER' },
    { userId: 1022, username: 'Mock 22', email: 'mock22@email.com', projectRole: 'MEMBER' },
    { userId: 1023, username: 'Mock 23', email: 'mock23@email.com', projectRole: 'MEMBER' },
    { userId: 1024, username: 'Mock 24', email: 'mock24@email.com', projectRole: 'MEMBER' },
    { userId: 1025, username: 'Mock 25', email: 'mock25@email.com', projectRole: 'MEMBER' },
];

/**
 * Tarefas iniciais mocadas para os detalhes do projeto
 */
export const MOCK_INITIAL_TASKS: ProjectTask[] = [
    {
        id: 101,
        title: 'Protótipo das Telas',
        description: 'Protótipos de telas no Figma',
        status: 'IN_PROGRESS',
        dueDate: '2025-06-26T00:00:00Z',
        ownerId: 1,
        assignments: [
            { userId: 1, username: 'Caio Dib' },
            { userId: 4, username: 'Ana M.' }
        ]
    },
    {
        id: 102,
        title: 'README.md',
        description: 'Documentação inicial do projeto',
        status: 'TO_DO',
        dueDate: '2025-05-28T00:00:00Z',
        ownerId: 2,
        assignments: [
            { userId: 2, username: 'Pedro L.' },
            { userId: 3, username: 'João S.' }
        ]
    },
    {
        id: 103,
        title: 'Configuração do Ambiente',
        description: 'Descrição longa para testar o layout de quebra de linha no card da tarefa.',
        status: 'DONE',
        dueDate: '2025-05-20T00:00:00Z',
        ownerId: 1,
        assignments: [
            { userId: 1, username: 'Caio Dib' },
            { userId: 2, username: 'Pedro L.' }
        ]
    },
    {
        id: 104,
        title: 'Tarefa Atrasada',
        description: 'Esta tarefa está atrasada.',
        status: 'TO_DO',
        dueDate: '2020-01-01T00:00:00Z',
        ownerId: 1,
        assignments: [
            { userId: 1, username: 'Caio Dib' }
        ]
    },
    {
        id: 105,
        title: 'Mais uma tarefa',
        description: 'Para preencher a lista.',
        status: 'TO_DO',
        dueDate: '2025-12-31T00:00:00Z',
        ownerId: 3,
        assignments: [
            { userId: 3, username: 'João S.' }
        ]
    },
];

/**
 * Tarefas mocadas para a tela de Tarefas
 */
export const MOCK_TASKS: Task[] = [
    {
        id: 101,
        title: 'Revisar protótipo de alta fidelidade',
        description: 'Verificar todos os fluxos de usuário.',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // Prazo: 5 dias a partir de hoje
        projectId: 1,
        projectName: 'Projeto TeamTacles',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 86400000 * 2).getTime(), // Criado há 2 dias
    },
    {
        id: 102,
        title: 'Desenvolver tela de Login',
        description: 'Implementar a interface e a lógica de autenticação.',
        dueDate: new Date(Date.now() + 86400000 * 10).toISOString(), // Prazo: 10 dias
        projectId: 1,
        projectName: 'Projeto TeamTacles',
        status: 'TO_DO',
        createdAt: new Date(Date.now() - 86400000).getTime(), // Criado ontem
    },
    {
        id: 103,
        title: 'Configurar ambiente de testes',
        description: 'Instalar e configurar o Jest e a Testing Library.',
        dueDate: new Date('2025-10-10T23:59:59Z').toISOString(), // Prazo: 10 de Outubro de 2025 (atrasado)
        projectId: 2,
        projectName: 'Website Redesign',
        status: 'TO_DO',
        createdAt: new Date('2025-10-01T23:59:59Z').getTime(),
    },
    {
        id: 104,
        title: 'Entregar relatório de performance',
        description: 'Gerar o relatório do último trimestre.',
        dueDate: new Date('2025-09-30T23:59:59Z').toISOString(), // Prazo: 30 de Setembro de 2025 (concluído)
        projectId: 2,
        projectName: 'Website Redesign',
        status: 'DONE',
        createdAt: new Date('2025-09-15T23:59:59Z').getTime(),
    },
];

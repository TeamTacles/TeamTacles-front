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
    { userId: 1, username: 'Caio Dib', email: 'caio@email.com', projectRole: 'OWNER' },
    { userId: 2, username: 'Pedro L.', email: 'pedro@email.com', projectRole: 'ADMIN' },
    { userId: 3, username: 'João S.', email: 'joao@email.com', projectRole: 'MEMBER' },
    { userId: 4, username: 'Ana M.', email: 'ana@email.com', projectRole: 'MEMBER' },
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

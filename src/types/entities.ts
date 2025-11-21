export interface Member {
  name: string;
  initials: string;
}

export interface TeamMemberDetail {
  userId: number;
  username: string;
  email: string;
  teamRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface Project {
  id: number;
  title: string;
  description: string;
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  teamMembers: Member[];
  createdAt: number;
  taskCount: number;
}

export interface TaskAssignment {
  userId: number;
  username: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  projectId: number;
  projectName: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
  originalStatus?: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; 
  createdAt: number;
  assignments: TaskAssignment[];
}

export interface Team {
  id: number | string;
  name?: string;
  title?: string;
  description: string;
  teamRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: Member[];
  createdAt: Date | number;
  memberCount: number;
  memberNames: string[];
}

export type TeamType = Team;
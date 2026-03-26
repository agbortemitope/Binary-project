import { create } from 'zustand';

export interface Team {
  id: string;
  name: string;
  currency: string;
  payoutMode: 'Instant' | 'Scheduled';
  payoutFrequency?: 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly';
  threshold: number;
  walletBalance: number;
  reservedBalance: number;
  createdBy: string;
  memberCount: number;
  activeTasks: number;
  nextPayoutDate?: string;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description: string;
  reward: number;
  assignedTo: string;
  assignedToName?: string;
  deadline: string;
  status: 'Active' | 'Submitted' | 'Approved' | 'Rejected' | 'Completed' | 'Paid';
  submission?: {
    fileUrl?: string;
    note?: string;
    submittedAt: string;
  };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Member';
  earnings: number;
  tasksCompleted: number;
  avatar?: string;
}

export interface Transaction {
  id: string;
  teamId: string;
  type: 'Funding' | 'Task Reserved' | 'Task Approved' | 'Payout Sent' | 'Withdrawal';
  amount: number;
  reference: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
}

export interface ChatRoom {
  id: string;
  teamId?: string;
  type: 'Group' | 'Direct' | 'Task';
  taskId?: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
}

interface TeamStore {
  teams: Team[];
  tasks: Task[];
  members: TeamMember[];
  transactions: Transaction[];
  chatRooms: ChatRoom[];
  messages: Message[];
  currentTeamId: string | null;
  
  // Actions
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string) => void;
  
  addMember: (member: TeamMember) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  removeMember: (id: string) => void;
  
  addTransaction: (transaction: Transaction) => void;
  fundWallet: (teamId: string, amount: number) => void;
  
  addMessage: (message: Message) => void;
  
  setCurrentTeam: (teamId: string | null) => void;
}

// Dummy seed data
const seedTeams: Team[] = [
  {
    id: '1',
    name: 'Marketing Team',
    currency: 'NGN',
    payoutMode: 'Scheduled',
    payoutFrequency: 'Weekly',
    threshold: 5000,
    walletBalance: 450000,
    reservedBalance: 85000,
    createdBy: 'lead-1',
    memberCount: 12,
    activeTasks: 8,
    nextPayoutDate: 'Mar 8, 2026',
  },
  {
    id: '2',
    name: 'Event Crew',
    currency: 'NGN',
    payoutMode: 'Instant',
    threshold: 0,
    walletBalance: 120000,
    reservedBalance: 35000,
    createdBy: 'lead-1',
    memberCount: 6,
    activeTasks: 4,
  },
];

const seedTasks: Task[] = [
  {
    id: '1',
    teamId: '1',
    title: 'Create Social Media Graphics',
    description: 'Design 5 Instagram posts for product launch',
    reward: 15000,
    assignedTo: 'user-1',
    assignedToName: 'Sarah Johnson',
    deadline: 'Mar 10, 2026',
    status: 'Submitted',
    submission: {
      fileUrl: 'https://example.com/file.zip',
      note: 'Completed all 5 graphics as requested',
      submittedAt: '2026-03-05T10:30:00Z',
    },
  },
  {
    id: '2',
    teamId: '1',
    title: 'Write Blog Post',
    description: 'Write a 1500-word blog post about digital marketing trends',
    reward: 20000,
    assignedTo: 'user-2',
    assignedToName: 'Mike Chen',
    deadline: 'Mar 12, 2026',
    status: 'Active',
  },
  {
    id: '3',
    teamId: '2',
    title: 'Event Setup',
    description: 'Setup venue for corporate event',
    reward: 25000,
    assignedTo: 'user-3',
    assignedToName: 'David Brown',
    deadline: 'Mar 8, 2026',
    status: 'Submitted',
    submission: {
      note: 'Venue is ready, photos attached',
      submittedAt: '2026-03-04T16:00:00Z',
    },
  },
  {
    id: '4',
    teamId: '1',
    title: 'Email Campaign Design',
    description: 'Design email template for newsletter',
    reward: 12000,
    assignedTo: 'user-1',
    assignedToName: 'Sarah Johnson',
    deadline: 'Mar 15, 2026',
    status: 'Active',
  },
];

const seedMembers: TeamMember[] = [
  {
    id: '1',
    teamId: '1',
    userId: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Member',
    earnings: 145000,
    tasksCompleted: 12,
  },
  {
    id: '2',
    teamId: '1',
    userId: 'user-2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'Manager',
    earnings: 230000,
    tasksCompleted: 18,
  },
  {
    id: '3',
    teamId: '2',
    userId: 'user-3',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'Member',
    earnings: 95000,
    tasksCompleted: 8,
  },
];

const seedTransactions: Transaction[] = [
  {
    id: '1',
    teamId: '1',
    type: 'Funding',
    amount: 500000,
    reference: 'FND-2026-001',
    date: '2026-03-01T09:00:00Z',
    status: 'Success',
  },
  {
    id: '2',
    teamId: '1',
    type: 'Task Reserved',
    amount: -15000,
    reference: 'TSK-2026-001',
    date: '2026-03-02T14:30:00Z',
    status: 'Success',
  },
  {
    id: '3',
    teamId: '2',
    type: 'Task Approved',
    amount: -25000,
    reference: 'TSK-2026-003',
    date: '2026-03-04T16:30:00Z',
    status: 'Success',
  },
];

const seedChatRooms: ChatRoom[] = [
  {
    id: '1',
    teamId: '1',
    type: 'Group',
    name: 'Marketing Team',
    lastMessage: 'Great work everyone!',
    lastMessageTime: '2026-03-05T11:20:00Z',
    unreadCount: 3,
  },
  {
    id: '2',
    teamId: '1',
    type: 'Task',
    taskId: '1',
    name: 'Create Social Media Graphics',
    lastMessage: 'Files submitted for review',
    lastMessageTime: '2026-03-05T10:30:00Z',
    unreadCount: 1,
  },
];

export const useTeamStore = create<TeamStore>((set) => ({
  teams: seedTeams,
  tasks: seedTasks,
  members: seedMembers,
  transactions: seedTransactions,
  chatRooms: seedChatRooms,
  messages: [],
  currentTeamId: null,

  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  
  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === id ? { ...team, ...updates } : team
      ),
    })),
  
  deleteTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== id),
    })),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  
  approveTask: (taskId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const team = state.teams.find((t) => t.id === task.teamId);
      if (!team) return state;

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'Approved' as const } : t
        ),
        teams: state.teams.map((t) =>
          t.id === task.teamId
            ? {
                ...t,
                reservedBalance: t.reservedBalance - task.reward,
              }
            : t
        ),
        transactions: [
          ...state.transactions,
          {
            id: `txn-${Date.now()}`,
            teamId: task.teamId,
            type: 'Task Approved' as const,
            amount: -task.reward,
            reference: `TSK-${taskId}`,
            date: new Date().toISOString(),
            status: 'Success' as const,
          },
        ],
      };
    }),
  
  rejectTask: (taskId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'Rejected' as const } : t
        ),
        teams: state.teams.map((t) =>
          t.id === task.teamId
            ? {
                ...t,
                reservedBalance: t.reservedBalance - task.reward,
                walletBalance: t.walletBalance + task.reward,
              }
            : t
        ),
      };
    }),

  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  
  updateMember: (id, updates) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === id ? { ...member, ...updates } : member
      ),
    })),
  
  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((member) => member.id !== id),
    })),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
  
  fundWallet: (teamId, amount) =>
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId
          ? { ...team, walletBalance: team.walletBalance + amount }
          : team
      ),
      transactions: [
        ...state.transactions,
        {
          id: `txn-${Date.now()}`,
          teamId,
          type: 'Funding' as const,
          amount,
          reference: `FND-${Date.now()}`,
          date: new Date().toISOString(),
          status: 'Success' as const,
        },
      ],
    })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setCurrentTeam: (teamId) => set({ currentTeamId: teamId }),
}));

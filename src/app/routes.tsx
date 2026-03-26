import { createBrowserRouter } from "react-router";
import { Welcome } from "./screens/Welcome";
import { SetPayoutMethod } from "./screens/SetPayoutMethod";
import { JoinTeam } from "./screens/JoinTeam";
import { Dashboard } from "./screens/Dashboard";
import { TasksList } from "./screens/TasksList";
import { TaskDetail } from "./screens/TaskDetail";
import { TeamChat } from "./screens/TeamChat";
import { ChatList } from "./screens/ChatList";
import { Earnings } from "./screens/Earnings";
import { Payouts } from "./screens/Payouts";
import { Profile } from "./screens/Profile";
import { Settings } from "./screens/Settings";
import { EditProfile } from "./screens/EditProfile";

// Auth Screens
import { Login } from "./screens/auth/Login";
import { Signup } from "./screens/auth/Signup";
import { VerifyOTP } from "./screens/auth/VerifyOTP";
import { ForgotPassword } from "./screens/auth/ForgotPassword";

// CrewLead Imports
import { WelcomeLead } from "./crewlead/screens/WelcomeLead";
import { CreateTeam } from "./crewlead/screens/CreateTeam";
import { DashboardLead } from "./crewlead/screens/DashboardLead";
import { TeamsScreen } from "./crewlead/screens/TeamsScreen";
import { ManageTeam } from "./crewlead/screens/ManageTeam";
import { TasksScreenLead } from "./crewlead/screens/TasksScreenLead";
import { CreateTask } from "./crewlead/screens/CreateTask";
import { TaskDetailLead } from "./crewlead/screens/TaskDetailLead";
import { ChatScreenLead } from "./crewlead/screens/ChatScreenLead";
import { ConversationScreen } from "./crewlead/screens/ConversationScreen";
import { WalletScreen } from "./crewlead/screens/WalletScreen";
import { ProfileScreen } from "./crewlead/screens/ProfileScreen";

export const router = createBrowserRouter([
  // Auth Routes
  {
    path: "/auth/login",
    Component: Login,
  },
  {
    path: "/auth/signup",
    Component: Signup,
  },
  {
    path: "/auth/verify-otp",
    Component: VerifyOTP,
  },
  {
    path: "/auth/forgot-password",
    Component: ForgotPassword,
  },
  
  // CrewMate Routes
  {
    path: "/",
    Component: Welcome,
  },
  {
    path: "/set-payout",
    Component: SetPayoutMethod,
  },
  {
    path: "/join-team",
    Component: JoinTeam,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/tasks",
    Component: TasksList,
  },
  {
    path: "/tasks/:id",
    Component: TaskDetail,
  },
  {
    path: "/chat",
    Component: ChatList,
  },
  {
    path: "/chat/:teamId",
    Component: TeamChat,
  },
  {
    path: "/earnings",
    Component: Earnings,
  },
  {
    path: "/payouts",
    Component: Payouts,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/edit-profile",
    Component: EditProfile,
  },
  
  // CrewLead Routes
  {
    path: "/lead",
    Component: WelcomeLead,
  },
  {
    path: "/lead/create-team",
    Component: CreateTeam,
  },
  {
    path: "/lead/dashboard",
    Component: DashboardLead,
  },
  {
    path: "/lead/teams",
    Component: TeamsScreen,
  },
  {
    path: "/lead/teams/:teamId",
    Component: ManageTeam,
  },
  {
    path: "/lead/tasks",
    Component: TasksScreenLead,
  },
  {
    path: "/lead/tasks/create",
    Component: CreateTask,
  },
  {
    path: "/lead/tasks/:taskId",
    Component: TaskDetailLead,
  },
  {
    path: "/lead/chat",
    Component: ChatScreenLead,
  },
  {
    path: "/lead/chat/:chatId",
    Component: ConversationScreen,
  },
  {
    path: "/lead/wallet",
    Component: WalletScreen,
  },
  {
    path: "/lead/profile",
    Component: ProfileScreen,
  },
]);
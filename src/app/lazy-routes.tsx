import { lazy } from "react";

// Lazy load all feature pages
const RepositoryDashboardPage = lazy(() => import("../features/repositories/RepositoryDashboardPage").then((m) => ({ default: m.RepositoryDashboardPage })));
const RepositoryListPage = lazy(() => import("../features/repositories/RepositoryListPage").then((m) => ({ default: m.RepositoryListPage })));
const RepositoryOverviewPage = lazy(() => import("../features/repositories/RepositoryOverviewPage").then((m) => ({ default: m.RepositoryOverviewPage })));
const IndexingProgressPage = lazy(() => import("../features/indexing/IndexingProgressPage").then((m) => ({ default: m.IndexingProgressPage })));
const FolderStructurePage = lazy(() => import("../features/graph/FolderStructurePage").then((m) => ({ default: m.FolderStructurePage })));
const ChatPage = lazy(() => import("../features/chat/ChatPage").then((m) => ({ default: m.ChatPage })));
const FileViewerPage = lazy(() => import("../features/files/FileViewerPage").then((m) => ({ default: m.FileViewerPage })));
const ProfilePage = lazy(() => import("../features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("./SettingsPage").then((m) => ({ default: m.SettingsPage })));
const GithubConnectionPage = lazy(() => import("../features/auth/GithubConnectionPage").then((m) => ({ default: m.GithubConnectionPage })));

// Auth pages (loaded immediately, not lazy)
export { AuthCallbackPage } from "../features/auth/AuthCallbackPage";
export { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage";
export { LoginPage } from "../features/auth/LoginPage";
export { ResetPasswordPage } from "../features/auth/ResetPasswordPage";
export { SignupPage } from "../features/auth/SignupPage";
export { VerifyEmailPage } from "../features/auth/VerifyEmailPage";
export { HomePage } from "./HomePage";
export { SplashPage } from "./SplashPage";

export const lazyRoutes = {
  RepositoryDashboardPage,
  RepositoryListPage,
  RepositoryOverviewPage,
  IndexingProgressPage,
  FolderStructurePage,
  ChatPage,
  FileViewerPage,
  ProfilePage,
  SettingsPage,
  GithubConnectionPage,
};

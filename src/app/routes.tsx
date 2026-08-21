import type { ReactElement } from "react";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingState } from "../shared/components";
import {
  AuthCallbackPage,
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  SignupPage,
  VerifyEmailPage,
  HomePage,
} from "./lazy-routes";
import { lazyRoutes, withSuspense } from "./lazy-routes";
import { ProtectedRoute } from "./auth-guard";
import { MainLayout } from "./MainLayout";

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingState message="Loading dashboard..." />}>
              <lazyRoutes.RepositoryDashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/repositories"
          element={
            <Suspense fallback={<LoadingState message="Loading repositories..." />}>
              <lazyRoutes.RepositoryListPage />
            </Suspense>
          }
        />
        <Route
          path="/repositories/:repoId"
          element={
            <Suspense fallback={<LoadingState message="Loading repository..." />}>
              <lazyRoutes.RepositoryOverviewPage />
            </Suspense>
          }
        />
        <Route
          path="/repositories/:repoId/structure"
          element={
            <Suspense fallback={<LoadingState message="Loading folder structure..." />}>
              <lazyRoutes.FolderStructurePage />
            </Suspense>
          }
        />
        <Route
          path="/repositories/:repoId/chat"
          element={
            <Suspense fallback={<LoadingState message="Loading chat..." />}>
              <lazyRoutes.ChatPage />
            </Suspense>
          }
        />
        <Route
          path="/files/:fileId"
          element={
            <Suspense fallback={<LoadingState message="Loading file..." />}>
              <lazyRoutes.FileViewerPage />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<LoadingState message="Loading profile..." />}>
              <lazyRoutes.ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingState message="Loading settings..." />}>
              <lazyRoutes.SettingsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

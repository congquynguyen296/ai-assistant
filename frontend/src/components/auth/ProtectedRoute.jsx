import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AppLayout from "@/components/layouts/AppLayout";

const ProtectedRoute = () => {
  const isAuthenticated = true;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner message="Đang tải..." variant="overlay" size="md" />
      </div>
    );
  }

  const Layout = AppLayout;

  return isAuthenticated ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;

import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner message="Đang tải..." variant="overlay" size="md" />
      </div>
    );
  }

  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/auth";
import React from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

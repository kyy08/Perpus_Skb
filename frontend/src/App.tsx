import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { StaffLayout } from "@/components/staff/StaffLayout";
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Books = lazy(() => import("@/pages/Books"));
const MasterData = lazy(() => import("@/pages/MasterData"));
const Members = lazy(() => import("@/pages/Members"));
const LoanRequests = lazy(() => import("@/pages/LoanRequests"));
const Loans = lazy(() => import("@/pages/Loans"));
const Fines = lazy(() => import("@/pages/Fines"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const BookCatalog = lazy(() => import("@/pages/BookCatalog"));
const MyRequests = lazy(() => import("@/pages/MyRequests"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
           <BrowserRouter>
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Memuat halaman...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<StaffLayout />}>
                  <Route index element={<Navigate to="/petugas" replace />} />
                  <Route element={<ProtectedRoute roles={["PETUGAS"]} />}>
                    <Route path="petugas" element={<Dashboard />} />
                    <Route path="petugas/books" element={<Books />} />
                    <Route path="petugas/master-data" element={<MasterData />} />
                    <Route path="petugas/members" element={<Members />} />
                    <Route path="petugas/requests" element={<LoanRequests />} />
                    <Route path="petugas/loans" element={<Loans />} />
                    <Route path="petugas/fines" element={<Fines />} />
                    <Route path="petugas/reports" element={<Reports />} />
                    <Route path="petugas/settings" element={<Settings />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={["ANGGOTA"]} />}>
                    <Route path="catalog" element={<BookCatalog />} />
                    <Route path="my-requests" element={<MyRequests />} />
                    <Route path="my-loans" element={<Loans />} />
                    <Route path="my-fines" element={<Fines />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

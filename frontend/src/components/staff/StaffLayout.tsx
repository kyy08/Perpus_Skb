import { Outlet } from "react-router-dom";
import { StaffHeader } from "./StaffHeader";
import { StaffSidebar } from "./StaffSidebar";

export function StaffLayout() {
  return (
    <div className="min-h-screen bg-background">
      <StaffSidebar />
      <div className="min-h-screen md:pl-64 transition-all duration-300">
        <StaffHeader />
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

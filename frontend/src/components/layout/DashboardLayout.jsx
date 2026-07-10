import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />

      {/* Mobile-only bar to open the dashboard sidebar drawer */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-card px-4 py-3 md:hidden">
        <button
          type="button"
          aria-label="Open dashboard menu"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text"
        >
          <Menu size={16} />
          Menu
        </button>
      </div>

      <div className="flex flex-1">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

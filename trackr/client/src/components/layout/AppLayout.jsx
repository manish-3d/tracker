import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-0)]">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <main className="flex-1 overflow-y-auto transition-all duration-200">
        <div className="max-w-6xl mx-auto p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

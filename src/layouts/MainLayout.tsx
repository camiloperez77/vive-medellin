import React from 'react';
import { NavigationBar } from '@/components/navigation/NavigationBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
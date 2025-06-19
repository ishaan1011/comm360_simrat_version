
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MeetingView } from './MeetingView';
import { EnhancedMessagingView } from '../messaging/EnhancedMessagingView';
import { ProfileView } from './ProfileView';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export type ViewType = 'meetings' | 'messages' | 'profile';

export const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<ViewType>('meetings');

  const renderView = () => {
    switch (currentView) {
      case 'meetings':
        return <MeetingView currentUser={currentUser} />;
      case 'messages':
        return <EnhancedMessagingView currentUser={currentUser} />;
      case 'profile':
        return <ProfileView currentUser={currentUser} onLogout={onLogout} />;
      default:
        return <MeetingView currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        currentUser={currentUser}
      />
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

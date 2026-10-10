import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { NestJsArchitectureView } from './components/NestJsArchitectureView';
import { DevOpsPipelineView } from './components/DevOpsPipelineView';
import { AcceptanceCriteriaView } from './components/AcceptanceCriteriaView';
import { UserProfile } from './types';
import { INITIAL_USER_PROFILE } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance'>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickDeploy = () => {
    setIsDeploying(true);
    showToast('CodePipeline Staging Deployment triggered: Testing, building, and applying zero-downtime DB migrations...');

    setTimeout(() => {
      setIsDeploying(false);
      showToast('Staging deployment complete: ECS Fargate updated to revision #42. Zero downtime.');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar with Breadcrumb and Action CTA */}
        <HeaderBar
          activeTab={activeTab}
          onQuickDeploy={handleQuickDeploy}
          isDeploying={isDeploying}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
        />

        {/* Global Status Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md p-3.5 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-xl text-xs font-mono text-slate-200 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 animate-ping" />
            <span className="leading-snug">{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'profile' && (
            <ProfileView
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
                showToast('Profile persisted to PostgreSQL and S3.');
              }}
            />
          )}
          {activeTab === 'nestjs' && <NestJsArchitectureView />}
          {activeTab === 'devops' && <DevOpsPipelineView />}
          {activeTab === 'acceptance' && <AcceptanceCriteriaView />}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span>Platform Staging Environment · NestJS / PostgreSQL / Angular / AWS ECS + RDS</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('acceptance')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Acceptance Criteria Checklist
              </button>
              <span>·</span>
              <span>All 4 Acceptance Criteria Met</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

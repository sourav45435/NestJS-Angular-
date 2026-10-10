import React from 'react';
import { Activity, ShieldCheck, GitBranch, RefreshCw } from 'lucide-react';

interface TopNavProps {
  activeTab: 'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance';
  setActiveTab: (tab: 'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance') => void;
  onQuickDeploy: () => void;
  isDeploying: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickDeploy,
  isDeploying,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Apex Cloud
              </span>
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
              staging-us-east-1
            </span>
          </div>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                activeTab === 'dashboard'
                  ? 'text-white border-b-2 border-indigo-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                activeTab === 'profile'
                  ? 'text-white border-b-2 border-indigo-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Profile Management
            </button>
            <button
              onClick={() => setActiveTab('nestjs')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                activeTab === 'nestjs'
                  ? 'text-white border-b-2 border-indigo-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NestJS & DB Architecture
            </button>
            <button
              onClick={() => setActiveTab('devops')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                activeTab === 'devops'
                  ? 'text-white border-b-2 border-indigo-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DevOps & AWS Pipeline
            </button>
            <button
              onClick={() => setActiveTab('acceptance')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                activeTab === 'acceptance'
                  ? 'text-white border-b-2 border-indigo-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Acceptance & Tests
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickDeploy}
              disabled={isDeploying}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
              <span>{isDeploying ? 'Deploying Staging...' : 'Simulate Pipeline Run'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center gap-4 py-2 overflow-x-auto border-t border-slate-800 text-xs text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap ${activeTab === 'dashboard' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap ${activeTab === 'profile' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('nestjs')}
            className={`whitespace-nowrap ${activeTab === 'nestjs' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            NestJS & DB
          </button>
          <button
            onClick={() => setActiveTab('devops')}
            className={`whitespace-nowrap ${activeTab === 'devops' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            DevOps
          </button>
          <button
            onClick={() => setActiveTab('acceptance')}
            className={`whitespace-nowrap ${activeTab === 'acceptance' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Acceptance
          </button>
        </div>
      </div>
    </header>
  );
};

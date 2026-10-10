import React from 'react';
import { Menu, RefreshCw, GitCommit, CheckCircle2 } from 'lucide-react';

interface HeaderBarProps {
  activeTab: 'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance';
  onQuickDeploy: () => void;
  isDeploying: boolean;
  onOpenMobileMenu: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  onQuickDeploy,
  isDeploying,
  onOpenMobileMenu,
}) => {
  const pageTitles: Record<string, string> = {
    dashboard: 'Real-Time Aggregated Telemetry Dashboard',
    profile: 'User Profile Management & S3 Avatar Storage',
    nestjs: 'NestJS Modules & TypeORM Database Layer',
    devops: 'AWS ECS Fargate & RDS CI/CD Pipeline',
    acceptance: 'Acceptance Criteria & Milestone Review',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 min-w-0 truncate">
          <span className="hidden sm:inline text-slate-500">Apex Cloud</span>
          <span className="hidden sm:inline text-slate-600">/</span>
          <span className="hidden md:inline text-slate-500">Staging Environment</span>
          <span className="hidden md:inline text-slate-600">/</span>
          <span className="text-white font-semibold truncate font-sans text-sm">
            {pageTitles[activeTab]}
          </span>
        </nav>
      </div>

      {/* Right: Environment Info & Action Button */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
          <span>staging:sha-7b81f9a</span>
        </div>

        <button
          onClick={onQuickDeploy}
          disabled={isDeploying}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
          <span>{isDeploying ? 'Deploying Staging...' : 'Simulate Pipeline Run'}</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { LayoutDashboard, UserCircle, Database, GitBranch, ShieldCheck, X, Server, Radio, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance';
  setActiveTab: (tab: 'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance') => void;
  currentUser: UserProfile;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Live Dashboard',
      description: 'Postgres Aggregations & WS Stream',
      icon: LayoutDashboard,
    },
    {
      id: 'profile' as const,
      label: 'Profile Management',
      description: 'User Details & S3 Avatar Upload',
      icon: UserCircle,
    },
    {
      id: 'nestjs' as const,
      label: 'NestJS & DB Architecture',
      description: 'REST, Gateway & TypeORM DDL',
      icon: Database,
    },
    {
      id: 'devops' as const,
      label: 'DevOps & AWS Pipeline',
      description: 'ECS Fargate, CDK & Rollback',
      icon: GitBranch,
    },
    {
      id: 'acceptance' as const,
      label: 'Acceptance & Tests',
      description: 'Jest, Zero-Downtime & Lighthouse',
      icon: ShieldCheck,
    },
  ];

  const handleSelectTab = (id: 'dashboard' | 'profile' | 'nestjs' | 'devops' | 'acceptance') => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col">
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                A
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  Apex Cloud
                </span>
                <span className="text-xs text-slate-400 font-mono block">
                  staging-us-east-1
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Workspace Pages
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-indigo-600/15 text-white border border-indigo-500/30 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm block truncate ${
                        isActive ? 'text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Cluster Status & User Card */}
        <div className="p-4 space-y-3 border-t border-slate-800">
          {/* Real-time Environment Status Box */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Cluster Architecture</span>
              <span className="text-emerald-400 text-xs">AWS ECS + RDS</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>ECS Fargate</span>
              </span>
              <span className="text-slate-300">2 / 2 Tasks</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>WebSockets</span>
              </span>
              <span className="text-emerald-400">Connected</span>
            </div>
          </div>

          {/* User Card */}
          <button
            onClick={() => handleSelectTab('profile')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 transition-colors text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-white block truncate group-hover:text-indigo-400 transition-colors">
                {currentUser.fullName}
              </span>
              <span className="text-xs text-slate-400 block truncate">
                {currentUser.role}
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};

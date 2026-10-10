export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  title: string;
  department: string;
  bio: string;
  avatarUrl: string;
  timezone: string;
  githubHandle: string;
  notificationSettings: {
    emailAlerts: boolean;
    slackSync: boolean;
    weeklyDigest: boolean;
    deploymentAlerts: boolean;
  };
  role: 'Platform Engineer' | 'DevOps Lead' | 'Full-Stack Developer' | 'Admin';
  createdAt: string;
  updatedAt: string;
}

export interface MetricAggregation {
  timestamp: string;
  activeTenants: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  throughputRps: number;
  cpuUtilization: number;
  rdsConnections: number;
  errorRatePercent: number;
}

export interface LiveTelemetryEvent {
  id: string;
  timestamp: string;
  channel: string;
  event: string;
  payload: {
    tenantId?: string;
    durationMs?: number;
    rowsAffected?: number;
    endpoint?: string;
    details?: string;
  };
  severity: 'nominal' | 'warning' | 'alert';
}

export interface PipelineStageInfo {
  id: string;
  name: string;
  category: 'Source' | 'Test' | 'Build' | 'Staging' | 'Verification' | 'Approval' | 'Production';
  status: 'succeeded' | 'in_progress' | 'pending' | 'failed' | 'rolled_back';
  durationSec: number;
  lastUpdated: string;
  details: string;
}

export interface TestCaseResult {
  suite: string;
  testName: string;
  type: 'unit' | 'e2e' | 'supertest';
  status: 'passed' | 'failed' | 'running';
  durationMs: number;
  assertionsCount: number;
}

import React, { useState, useEffect, useMemo } from 'react';
import { MetricAggregation, LiveTelemetryEvent } from '../types';
import { INITIAL_METRIC_AGGREGATION, INITIAL_TELEMETRY_EVENTS } from '../data/mockData';
import { Database, Radio, Server, Cpu, Play, Pause, Zap, ArrowUpRight, ArrowDownRight, Filter, Search, Terminal } from 'lucide-react';

interface TimePoint {
  timeStr: string;
  rps: number;
  p95: number;
  dbQueries: number;
}

export const DashboardView: React.FC = () => {
  const [isWsLive, setIsWsLive] = useState<boolean>(true);
  const [streamIntervalMs, setStreamIntervalMs] = useState<number>(2000);
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h'>('15m');
  const [metrics, setMetrics] = useState<MetricAggregation>(INITIAL_METRIC_AGGREGATION);
  const [telemetryEvents, setTelemetryEvents] = useState<LiveTelemetryEvent[]>(INITIAL_TELEMETRY_EVENTS);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'nominal' | 'warning' | 'alert'>('all');

  // Time series buffer for real-time SVG charting
  const [history, setHistory] = useState<TimePoint[]>(() => {
    const points: TimePoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      points.push({
        timeStr,
        rps: 1780 + Math.floor(Math.sin(i * 0.5) * 120 + Math.random() * 80),
        p95: 38 + Math.floor(Math.cos(i * 0.4) * 8 + Math.random() * 5),
        dbQueries: 4200 + Math.floor(Math.random() * 400),
      });
    }
    return points;
  });

  // Simulated WebSocket tick from NestJS @WebSocketGateway
  useEffect(() => {
    if (!isWsLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const deltaRps = Math.floor((Math.random() - 0.48) * 90);
      const newRps = Math.max(1400, Math.min(2600, metrics.throughputRps + deltaRps));
      const newP95 = +(38 + Math.random() * 12 + (newRps > 2100 ? 10 : 0)).toFixed(1);
      const newCpu = +(34 + Math.random() * 14 + (newRps / 100)).toFixed(1);
      const newConns = Math.floor(40 + Math.random() * 18);

      const updatedMetrics: MetricAggregation = {
        timestamp: now.toISOString(),
        activeTenants: metrics.activeTenants + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        avgLatencyMs: +(newP95 * 0.42).toFixed(1),
        p95LatencyMs: newP95,
        throughputRps: newRps,
        cpuUtilization: newCpu,
        rdsConnections: newConns,
        errorRatePercent: +(0.02 + Math.random() * 0.05).toFixed(3),
      };

      setMetrics(updatedMetrics);

      setHistory(prev => {
        const next = [...prev.slice(1), {
          timeStr,
          rps: newRps,
          p95: newP95,
          dbQueries: Math.floor(newRps * 2.4),
        }];
        return next;
      });

      // Randomly append incoming telemetry event
      if (Math.random() > 0.4) {
        const channels = ['pg_aggregates', 'ws_gateway', 'rds_postgres', 'ecs_fargate'];
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        const isSpike = newRps > 2200;
        
        const newEvent: LiveTelemetryEvent = {
          id: `evt_${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          channel: randomChannel,
          event: isSpike 
            ? 'High Throughput Window Aggregated' 
            : randomChannel === 'pg_aggregates' 
              ? 'Continuous Aggregate Hypertable Sync'
              : randomChannel === 'ws_gateway'
                ? 'WebSocket Frame Dispatched to Client Rooms'
                : 'RDS Connection Pool Health Probe Nominal',
          payload: {
            details: `PostgreSQL aggregate partition evaluated in ${(Math.random() * 4 + 1).toFixed(2)}ms`,
            durationMs: +(Math.random() * 5 + 1).toFixed(1),
            rowsAffected: Math.floor(Math.random() * 200 + 50),
          },
          severity: isSpike ? 'warning' : 'nominal',
        };

        setTelemetryEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      }
    }, streamIntervalMs);

    return () => clearInterval(interval);
  }, [isWsLive, streamIntervalMs, metrics]);

  // Inject burst trigger
  const handleSimulateBurst = () => {
    const burstRps = 2480;
    const burstP95 = 58.4;
    setMetrics(prev => ({
      ...prev,
      throughputRps: burstRps,
      p95LatencyMs: burstP95,
      cpuUtilization: 64.2,
      rdsConnections: 74,
    }));

    const burstEvent: LiveTelemetryEvent = {
      id: `evt_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      channel: 'pg_aggregates',
      event: 'Simulated PostgreSQL Surge Batch Aggregation',
      payload: {
        details: 'Burst of 2,480 req/s ingested. PostgreSQL aggregate continuous materialized view updated with zero locks.',
        durationMs: 7.8,
        rowsAffected: 2480,
      },
      severity: 'nominal',
    };

    setTelemetryEvents(prev => [burstEvent, ...prev.slice(0, 19)]);
  };

  // Filtered telemetry events
  const filteredEvents = useMemo(() => {
    return telemetryEvents.filter(evt => {
      const matchesSearch = searchFilter === '' ||
        evt.event.toLowerCase().includes(searchFilter.toLowerCase()) ||
        evt.channel.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (evt.payload.details && evt.payload.details.toLowerCase().includes(searchFilter.toLowerCase()));
      
      const matchesSeverity = severityFilter === 'all' || evt.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [telemetryEvents, searchFilter, severityFilter]);

  // SVG Chart Calculation
  const maxRps = Math.max(...history.map(h => h.rps), 2600);
  const minRps = Math.min(...history.map(h => h.rps), 1400);
  const chartHeight = 160;
  const chartWidth = 600;

  const rpsPoints = history.map((pt, index) => {
    const x = (index / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((pt.rps - minRps) / (maxRps - minRps || 1)) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  const p95Points = history.map((pt, index) => {
    const x = (index / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((pt.p95 - 20) / (70 - 20)) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Header bar & controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              PostgreSQL Aggregated Telemetry & Real-Time Stream
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                WebSocket connected
              </span>
              <span>·</span>
              <span>ns: /telemetry</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-400 max-w-3xl">
            Live Angular client subscriber consuming NestJS WebSockets and PostgreSQL aggregated continuous queries.
          </p>
        </div>

        {/* WebSocket Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setIsWsLive(!isWsLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                isWsLive ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isWsLive ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isWsLive ? 'Live Feed' : 'Paused'}</span>
            </button>

            <select
              value={streamIntervalMs}
              onChange={(e) => setStreamIntervalMs(Number(e.target.value))}
              className="bg-transparent text-slate-300 px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value={1000} className="bg-slate-900 text-slate-200">1.0s tick</option>
              <option value={2000} className="bg-slate-900 text-slate-200">2.0s tick</option>
              <option value={5000} className="bg-slate-900 text-slate-200">5.0s tick</option>
            </select>
          </div>

          <button
            onClick={handleSimulateBurst}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Traffic Surge</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Throughput (Aggregated)</span>
            <Database className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.throughputRps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">req/sec</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+11.8% vs baseline</span>
            <span className="text-slate-500">· pg_continuous_agg</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>p95 Latency (NestJS API)</span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.p95LatencyMs}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Target &lt; 50ms</span>
            <span className="text-slate-500">· avg {metrics.avgLatencyMs}ms</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Tenants (WS Channels)</span>
            <Radio className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.activeTenants}
            </span>
            <span className="text-xs text-slate-400 font-mono">connected</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Redis pub/sub adapter</span>
            <span className="text-slate-500">· 0 dropped frames</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>RDS PostgreSQL Pool</span>
            <Server className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.rdsConnections}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100 conns</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span>CPU {metrics.cpuUtilization}%</span>
            <span className="text-slate-500">· 0.04% error rate</span>
          </div>
        </div>
      </div>

      {/* Real-time Time Series Chart */}
      <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Aggregated Metrics Stream (PostgreSQL continuous views → WebSocket)
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block rounded" />
                Throughput (req/s)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />
                p95 Latency (ms)
              </span>
              <span>·</span>
              <span className="font-mono text-slate-500">Auto-refresh: {streamIntervalMs / 1000}s</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setTimeRange('15m')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                timeRange === '15m' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 15m
            </button>
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                timeRange === '1h' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Hour
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                timeRange === '24h' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              24 Hours
            </button>
          </div>
        </div>

        {/* Dynamic SVG Visualizer */}
        <div className="relative w-full h-44 bg-slate-950/70 rounded-lg p-2 overflow-hidden border border-slate-800/60">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            {/* Grid lines */}
            <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
            <line x1="0" y1="70" x2={chartWidth} y2="70" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
            <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

            {/* Throughput Area Fill */}
            <polygon
              points={`0,${chartHeight} ${rpsPoints} ${chartWidth},${chartHeight}`}
              fill="rgba(99, 102, 241, 0.12)"
            />

            {/* Throughput Line (Indigo) */}
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={rpsPoints}
            />

            {/* p95 Line (Amber) */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              points={p95Points}
            />
          </svg>

          {/* Value markers */}
          <div className="absolute top-2 right-3 flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            <span className="text-indigo-400">RPS: {metrics.throughputRps}</span>
            <span className="text-amber-400">p95: {metrics.p95LatencyMs}ms</span>
          </div>
        </div>

        {/* Live SQL Aggregation Query Preview */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>PostgreSQL Aggregation Engine (NestJS TypeORM Query)</span>
            </div>
            <span className="text-slate-500">Execution time: ~2.4ms</span>
          </div>
          <code className="text-slate-400">
            <span className="text-indigo-400">SELECT</span> date_trunc(<span className="text-emerald-400">'minute'</span>, created_at) <span className="text-indigo-400">AS</span> time_bucket,
            tenant_id, <span className="text-indigo-400">COUNT</span>(*) <span className="text-indigo-400">AS</span> req_count,
            <span className="text-indigo-400">PERCENTILE_CONT</span>(0.95) <span className="text-indigo-400">WITHIN GROUP</span> (<span className="text-indigo-400">ORDER BY</span> latency_ms) <span className="text-indigo-400">AS</span> p95_latency
            <span className="text-indigo-400"> FROM</span> telemetry_events <span className="text-indigo-400">WHERE</span> created_at &gt; NOW() - INTERVAL <span className="text-emerald-400">'15 minutes'</span>
            <span className="text-indigo-400"> GROUP BY</span> 1, 2 <span className="text-indigo-400">ORDER BY</span> time_bucket <span className="text-indigo-400">DESC</span>;
          </code>
        </div>
      </div>

      {/* Live WebSocket Event Stream Table */}
      <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Live WebSocket Broadcast Stream
            </h2>
            <p className="text-xs text-slate-400">
              Direct telemetry events dispatched by NestJS Gateway to Angular components
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter events..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setSeverityFilter('all')}
                className={`px-2 py-1 rounded cursor-pointer ${severityFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setSeverityFilter('nominal')}
                className={`px-2 py-1 rounded cursor-pointer ${severityFilter === 'nominal' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              >
                Nominal
              </button>
              <button
                onClick={() => setSeverityFilter('warning')}
                className={`px-2 py-1 rounded cursor-pointer ${severityFilter === 'warning' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'}`}
              >
                Warning
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3 font-normal">Timestamp</th>
                <th className="py-2.5 px-3 font-normal">Channel</th>
                <th className="py-2.5 px-3 font-normal">Event Description</th>
                <th className="py-2.5 px-3 font-normal">Details & Execution</th>
                <th className="py-2.5 px-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap tabular-nums">
                    {evt.timestamp}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-400 whitespace-nowrap">
                    #{evt.channel}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                    {evt.event}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">
                    <span>{evt.payload.details}</span>
                    {evt.payload.durationMs && (
                      <span className="ml-2 text-slate-500 font-mono">({evt.payload.durationMs}ms)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className={evt.severity === 'nominal' ? 'text-emerald-400' : evt.severity === 'warning' ? 'text-amber-400' : 'text-rose-400'}>
                      {evt.severity === 'nominal' ? 'nominal' : evt.severity === 'warning' ? 'elevated' : 'alert'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    No telemetry events matched the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

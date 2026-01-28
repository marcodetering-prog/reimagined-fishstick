"use client";

import { useEffect, useState } from "react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { PeakHoursChart } from "@/components/dashboard/PeakHoursChart";
import { ClientSelector } from "@/components/ClientSelector";
import {
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";

interface KPIData {
  avgResponseTimeMs: number | null;
  avgMessageLength: number | null;
  avgResponseQuality: number | null;
  resolutionRate: number | null;
  avgSatisfaction: number | null;
  avgConversationDuration: number | null;
  totalConversations: number;
  totalMessages: number;
  activeTenants: number;
  messagesPerDay: number | null;
  avgTurnsToResolution: number | null;
  messagesOverTime: Array<{ date: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    fetchKPIs();
  }, [selectedClient]);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const url = selectedClient
        ? `/api/kpis?clientId=${selectedClient}`
        : "/api/kpis";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch KPIs");
      }
      const data = await response.json();
      setKpis(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading KPIs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <button
            onClick={fetchKPIs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No data available</p>
        <a
          href="/upload"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Upload Chat History
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Performance Dashboard</h2>
        <p className="text-muted-foreground">
          Track and analyze AI-tenant interaction metrics
        </p>
      </div>

      <div className="bg-accent/30 p-4 rounded-lg">
        <ClientSelector
          value={selectedClient}
          onChange={setSelectedClient}
          showAllOption={true}
        />
      </div>

      {/* Response Metrics */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Response Metrics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricsCard
            title="Avg Response Time"
            value={kpis.avgResponseTimeMs}
            unit="ms"
            icon={Clock}
            description="Average time for AI to respond"
          />
          <MetricsCard
            title="Avg Message Length"
            value={kpis.avgMessageLength}
            unit="chars"
            icon={MessageSquare}
            description="Average AI response length"
          />
          <MetricsCard
            title="Response Quality"
            value={kpis.avgResponseQuality}
            unit="/ 5"
            icon={Star}
            description="Average satisfaction rating"
          />
        </div>
      </div>

      {/* Conversation Metrics */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Conversation Metrics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricsCard
            title="Resolution Rate"
            value={kpis.resolutionRate}
            icon={CheckCircle}
            format="percentage"
            description="% of conversations resolved"
          />
          <MetricsCard
            title="Avg Satisfaction"
            value={kpis.avgSatisfaction}
            unit="/ 5"
            icon={Star}
            description="Overall satisfaction score"
          />
          <MetricsCard
            title="Avg Duration"
            value={kpis.avgConversationDuration}
            icon={Clock}
            format="duration"
            description="Average conversation length"
          />
        </div>
      </div>

      {/* Usage Metrics */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Usage Metrics</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricsCard
            title="Total Conversations"
            value={kpis.totalConversations}
            icon={MessageSquare}
            format="number"
          />
          <MetricsCard
            title="Total Messages"
            value={kpis.totalMessages}
            icon={Activity}
            format="number"
          />
          <MetricsCard
            title="Active Tenants"
            value={kpis.activeTenants}
            icon={Users}
            format="number"
          />
          <MetricsCard
            title="Messages/Day"
            value={kpis.messagesPerDay}
            icon={TrendingUp}
            format="number"
          />
        </div>
      </div>

      {/* AI Accuracy Metrics */}
      <div>
        <h3 className="text-xl font-semibold mb-4">AI Accuracy Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricsCard
            title="Avg Turns to Resolution"
            value={kpis.avgTurnsToResolution}
            icon={TrendingUp}
            format="number"
            description="Average exchanges before resolving"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <UsageChart data={kpis.messagesOverTime} />
        <PeakHoursChart data={kpis.peakHours} />
      </div>
    </div>
  );
}

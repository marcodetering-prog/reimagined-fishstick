"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Upload, FileText, BarChart3, TrendingUp, Clock, MessageSquare, Users, CheckCircle, Star, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { PeakHoursChart } from "@/components/dashboard/PeakHoursChart";

interface Client {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

interface UploadRecord {
  id: string;
  filename: string;
  fileSize: number;
  recordsCount: number;
  uploadedAt: string;
  status: string;
}

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

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataTimeRange, setDataTimeRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    fetchClientData();
  }, [params.id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch client info
      const clientsResponse = await fetch("/api/clients");
      if (!clientsResponse.ok) throw new Error("Failed to fetch client");
      const clientsData = await clientsResponse.json();
      const clientData = clientsData.clients.find((c: Client) => c.id === params.id);

      if (!clientData) {
        console.error("Client not found");
        return;
      }

      setClient(clientData);

      // Fetch stats to get upload info
      const statsResponse = await fetch(`/api/clients/stats?clientId=${params.id}`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        if (stats.dataTimeRange) {
          setDataTimeRange(stats.dataTimeRange);
        }
      }

      // Fetch uploads (would need a new API endpoint for this)
      // For now, we'll infer from the stats

      // Fetch KPIs
      const kpisResponse = await fetch(`/api/kpis?clientId=${params.id}`);
      if (kpisResponse.ok) {
        const kpisData = await kpisResponse.json();
        setKpis(kpisData);
      }
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNew = () => {
    router.push(`/upload?clientId=${params.id}`);
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: client.color || "#3b82f6" }}
        >
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
          {client.description && (
            <p className="text-muted-foreground">{client.description}</p>
          )}
        </div>
        <Button onClick={handleUploadNew}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Data
        </Button>
      </div>

      {/* Data Time Range */}
      {dataTimeRange && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Data Period</CardTitle>
            </div>
            <CardDescription>Time range of uploaded conversation data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="text-lg font-semibold">
                  {new Date(dataTimeRange.start).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="text-lg font-semibold">
                  {new Date(dataTimeRange.end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      {!kpis ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No data uploaded yet</p>
            <Button onClick={handleUploadNew}>
              <Upload className="h-4 w-4 mr-2" />
              Upload First Dataset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

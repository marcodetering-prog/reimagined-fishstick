"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Calendar, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Client {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

interface ClientStats {
  uploadsCount: number;
  conversationsCount: number;
  messagesCount: number;
  lastUploadDate?: string;
}

export default function ClientsOverview() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientStats, setClientStats] = useState<Record<string, ClientStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data.clients);

      // Fetch stats for each client
      const stats: Record<string, ClientStats> = {};
      for (const client of data.clients) {
        const statsResponse = await fetch(`/api/clients/stats?clientId=${client.id}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          stats[client.id] = statsData;
        }
      }
      setClientStats(stats);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleNewClient = () => {
    router.push("/upload");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients Overview</h2>
          <p className="text-muted-foreground">
            Manage your clients and view their AI performance metrics
          </p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first client to start uploading chat data and analyzing AI performance
            </p>
            <Button onClick={handleNewClient}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const stats = clientStats[client.id] || {
              uploadsCount: 0,
              conversationsCount: 0,
              messagesCount: 0,
            };

            return (
              <Card
                key={client.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleClientClick(client.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: client.color || "#3b82f6" }}
                      >
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        {client.description && (
                          <CardDescription className="text-sm mt-1">
                            {client.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Uploads</span>
                      </div>
                      <span className="font-medium">{stats.uploadsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Conversations</span>
                      </div>
                      <span className="font-medium">{stats.conversationsCount.toLocaleString()}</span>
                    </div>
                    {stats.lastUploadDate && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Last Upload</span>
                        </div>
                        <span className="font-medium">
                          {new Date(stats.lastUploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

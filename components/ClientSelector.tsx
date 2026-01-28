"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";

interface Client {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

interface ClientSelectorProps {
  value: string | null;
  onChange: (clientId: string | null) => void;
  required?: boolean;
  showAllOption?: boolean;
}

export function ClientSelector({ value, onChange, required = false, showAllOption = false }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
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
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">
        Select Client {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          required={required}
          disabled={loading}
          className="w-full px-3 py-2 pl-10 pr-8 border rounded-md bg-background appearance-none cursor-pointer disabled:opacity-50"
        >
          {showAllOption && <option value="">All Clients</option>}
          {!showAllOption && <option value="">Select a client...</option>}
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      {selectedClient && selectedClient.color && (
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedClient.color }}
          />
          {selectedClient.description && <span>{selectedClient.description}</span>}
        </div>
      )}
      {loading && (
        <p className="text-xs text-muted-foreground mt-1">Loading clients...</p>
      )}
      {!loading && clients.length === 0 && (
        <p className="text-xs text-destructive mt-1">
          No clients available. Please create a client first.
        </p>
      )}
    </div>
  );
}

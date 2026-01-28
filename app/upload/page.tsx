"use client";

import { useState, useEffect, Suspense } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ClientSelector } from "@/components/ClientSelector";
import { ClientManager } from "@/components/ClientManager";
import { useRouter, useSearchParams } from "next/navigation";

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Pre-select client from URL if provided
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    if (clientId) {
      setSelectedClient(clientId);
    }
  }, [searchParams]);

  const handleUploadComplete = () => {
    // Redirect back to client page or home
    const clientId = searchParams.get('clientId');
    setTimeout(() => {
      if (clientId) {
        router.push(`/clients/${clientId}`);
      } else {
        router.push('/');
      }
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Data</h2>
        <p className="text-muted-foreground">
          Import chat history files to analyze AI performance
        </p>
      </div>

      <ClientManager />

      <div className="bg-accent/30 p-4 rounded-lg">
        <ClientSelector
          value={selectedClient}
          onChange={setSelectedClient}
          required={true}
        />
      </div>

      <FileUploader clientId={selectedClient} onUploadComplete={handleUploadComplete} />

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Supported Data Formats</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The system supports multiple CSV formats. Your data will be automatically detected and transformed.
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Format 1: Standard Format</h4>
            <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`conversation_id,tenant_id,timestamp,role,message,response_time_ms,resolved,satisfaction_score
conv_001,tenant_123,2024-01-15T10:00:00Z,tenant,"I need help with my account",,,
conv_001,tenant_123,2024-01-15T10:00:02Z,ai,"I'd be happy to help!",2000,,`}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Format 2: Alternative Format (Content, MessageType, TimeSent, ConversationId)</h4>
            <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`Content,MessageType,TimeSent,ConversationId
"I need help with my account",3,2025-03-24 08:39:41,conv_001
"I'd be happy to help!",1,2025-03-24 08:39:45,conv_001`}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              • MessageType: 1 = AI response, 3 = User message (other types are filtered out)
              <br />
              • System messages (type 5, 6) are automatically excluded
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">JSON Format:</h4>
            <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`[
  {
    "conversation_id": "conv_001",
    "tenant_id": "tenant_123",
    "timestamp": "2024-01-15T10:00:00Z",
    "role": "tenant",
    "message": "I need help with my account"
  },
  {
    "conversation_id": "conv_001",
    "tenant_id": "tenant_123",
    "timestamp": "2024-01-15T10:00:02Z",
    "role": "ai",
    "message": "I'd be happy to help!",
    "response_time_ms": 2000
  }
]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p>Loading...</p></div>}>
      <UploadPageContent />
    </Suspense>
  );
}

"use client";

import { FileUploader } from "@/components/FileUploader";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Redirect to dashboard after successful upload
    setTimeout(() => {
      router.push('/');
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

      <FileUploader onUploadComplete={handleUploadComplete} />

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Sample Data Format</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">CSV Example:</h4>
            <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`conversation_id,tenant_id,timestamp,role,message,response_time_ms,resolved,satisfaction_score
conv_001,tenant_123,2024-01-15T10:00:00Z,tenant,"I need help with my account",,,
conv_001,tenant_123,2024-01-15T10:00:02Z,ai,"I'd be happy to help! What seems to be the issue?",2000,,
conv_001,tenant_123,2024-01-15T10:01:00Z,tenant,"I can't login",,,
conv_001,tenant_123,2024-01-15T10:01:03Z,ai,"Let me help you reset your password.",3000,true,4`}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">JSON Example:</h4>
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
    "message": "I'd be happy to help! What seems to be the issue?",
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

"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface FileUploaderProps {
  clientId: string | null;
  onUploadComplete?: () => void;
}

export function FileUploader({ clientId, onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    recordsCount?: number;
    conversationsCount?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setUploadResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const isValidFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json');
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!clientId) {
      setUploadResult({
        success: false,
        message: 'Please select a client before uploading',
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: 'File uploaded successfully!',
          recordsCount: data.recordsCount,
          conversationsCount: data.conversationsCount,
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadComplete?.();
      } else {
        setUploadResult({
          success: false,
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Chat History</CardTitle>
        <CardDescription>
          Upload CSV or JSON files containing AI-tenant chat histories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${file ? 'bg-accent/50' : ''}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-12 w-12 text-primary" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop your CSV or JSON file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .csv, .json
              </p>
            </div>
          )}
        </div>

        {file && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        )}

        {uploadResult && (
          <div
            className={`
              flex items-start gap-3 p-4 rounded-lg border
              ${uploadResult.success
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
              }
            `}
          >
            {uploadResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  uploadResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                }`}
              >
                {uploadResult.message}
              </p>
              {uploadResult.success && uploadResult.recordsCount && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Imported {uploadResult.recordsCount} messages across{' '}
                  {uploadResult.conversationsCount} conversations
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Expected Format</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Your file should contain the following fields:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>conversation_id</strong>: Unique conversation identifier</li>
            <li>• <strong>tenant_id</strong>: Tenant identifier</li>
            <li>• <strong>timestamp</strong>: ISO8601 datetime</li>
            <li>• <strong>role</strong>: "ai" or "tenant"</li>
            <li>• <strong>message</strong>: Message content</li>
            <li>• <strong>response_time_ms</strong>: Response time in ms (optional)</li>
            <li>• <strong>resolved</strong>: Boolean or "true"/"false" (optional)</li>
            <li>• <strong>satisfaction_score</strong>: Number 1-5 (optional)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

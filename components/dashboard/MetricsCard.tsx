import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number | null;
  unit?: string;
  icon?: LucideIcon;
  description?: string;
  format?: "number" | "percentage" | "duration";
}

export function MetricsCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  format = "number",
}: MetricsCardProps) {
  const formattedValue = value !== null ? formatValue(value, format) : "N/A";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formattedValue}
          {unit && value !== null && <span className="text-lg ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function formatValue(value: number, format: "number" | "percentage" | "duration"): string {
  switch (format) {
    case "percentage":
      return `${formatNumber(value, 1)}%`;
    case "duration":
      return formatDuration(value);
    case "number":
    default:
      return formatNumber(value, 2);
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

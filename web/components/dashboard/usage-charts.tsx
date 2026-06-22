"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AgentSlice, DailyPoint } from "@/lib/queries/stats";

const dailyConfig = {
  count: { label: "Messages", color: "var(--chart-1)" },
} satisfies ChartConfig;

const agentConfig = {
  count: { label: "Messages", color: "var(--chart-2)" },
} satisfies ChartConfig;

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
      {label}
    </div>
  );
}

export function MessagesDailyChart({ data }: { data: DailyPoint[] }) {
  return (
    <Card className="surface-gradient">
      <CardHeader>
        <CardTitle>Messages par jour</CardTitle>
        <CardDescription>30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState label="Aucun message pour l'instant." />
        ) : (
          <ChartContainer config={dailyConfig} className="h-[220px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis hide allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="count"
                type="monotone"
                stroke="var(--chart-1)"
                fill="url(#fillCount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function MessagesPerAgentChart({ data }: { data: AgentSlice[] }) {
  return (
    <Card className="surface-gradient">
      <CardHeader>
        <CardTitle>Messages par agent</CardTitle>
        <CardDescription>Répartition de l'activité</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState label="Aucune activité par agent." />
        ) : (
          <ChartContainer config={agentConfig} className="h-[220px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="agent"
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--chart-2)" radius={6} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

import { Bot, FileText, MessageCircle, MessagesSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MessagesDailyChart,
  MessagesPerAgentChart,
} from "@/components/dashboard/usage-charts";
import {
  getMessagesDaily,
  getMessagesPerAgent,
  getOverview,
} from "@/lib/queries/stats";
import { FREE_AGENT_LIMIT } from "@/lib/plan";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [overview, daily, perAgent] = await Promise.all([
    getOverview(userId),
    getMessagesDaily(userId),
    getMessagesPerAgent(userId),
  ]);

  const kpis = [
    {
      label: "Conversations",
      value: overview.conversationCount,
      icon: MessagesSquare,
    },
    { label: "Messages", value: overview.messageCount, icon: MessageCircle },
    { label: "Fichiers importés", value: overview.fileCount, icon: FileText },
  ];

  const agentPct = Math.min(
    100,
    Math.round((overview.agentCount / FREE_AGENT_LIMIT) * 100),
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Bonjour {session.user.name ?? ""}, voici un aperçu de votre activité.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Bot className="size-4" /> Agents
            </CardDescription>
            <CardTitle className="font-mono text-3xl tabular-nums">
              {overview.agentCount}
              <span className="text-muted-foreground text-base">
                {" "}
                / {FREE_AGENT_LIMIT}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={agentPct} />
          </CardContent>
        </Card>

        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="glass">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Icon className="size-4" /> {label}
              </CardDescription>
              <CardTitle className="font-mono text-3xl tabular-nums">
                {value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-muted-foreground text-xs">Total</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MessagesDailyChart data={daily} />
        <MessagesPerAgentChart data={perAgent} />
      </div>
    </div>
  );
}

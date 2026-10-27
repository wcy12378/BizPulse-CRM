import type { MoneyTotal } from "./money-totals";

export type HomeTask = {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  status: string;
};

export type HomeAgentRun = {
  id: string;
  agentName: string;
  task: string;
  status: string;
  createdAt: string;
};

export type HomePipelineStage = {
  id: string;
  name: string;
  slug?: string;
  count: number;
  totals: MoneyTotal[];
};

export type HomeDashboardData = {
  contactCount: number;
  activeLeadCount: number;
  openTaskCount: number;
  activeLeadValues: MoneyTotal[];
  tasks: HomeTask[];
  agentRuns: HomeAgentRun[];
  stages: HomePipelineStage[];
  pipelineName: string | null;
  pipelineSlug?: string;
};

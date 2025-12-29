"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  PHASE_1: "hsl(220, 70%, 50%)",
  PHASE_2: "hsl(150, 60%, 45%)",
  PHASE_3: "hsl(45, 90%, 50%)",
  PHASE_4: "hsl(280, 60%, 50%)",
};

const STATUS_COLORS = {
  withLia: "hsl(150, 60%, 45%)",
  withoutLia: "hsl(0, 60%, 55%)",
};

type PhaseData = {
  PHASE_1: number;
  PHASE_2: number;
  PHASE_3: number;
  PHASE_4: number;
};

type PhaseChartProps = {
  data: PhaseData;
  totalStudents: number;
};

export function PhaseDistributionChart({ data, totalStudents }: PhaseChartProps) {
  const chartData = [
    { name: "FAS 1", value: data.PHASE_1, phase: "PHASE_1" },
    { name: "FAS 2", value: data.PHASE_2, phase: "PHASE_2" },
    { name: "FAS 3", value: data.PHASE_3, phase: "PHASE_3" },
    { name: "FAS 4", value: data.PHASE_4, phase: "PHASE_4" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fördelning per fas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, totalStudents || 10]} />
              <YAxis dataKey="name" type="category" width={60} />
              <Tooltip
                formatter={(value) => [`${value} studerande`, "Antal"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.phase}
                    fill={COLORS[entry.phase as keyof typeof COLORS]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

type LiaStatusChartProps = {
  withLia: number;
  total: number;
};

export function LiaStatusChart({ withLia, total }: LiaStatusChartProps) {
  const withoutLia = total - withLia;
  const chartData = [
    { name: "Med LIA", value: withLia },
    { name: "Utan LIA", value: withoutLia },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>LIA-status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                <Cell fill={STATUS_COLORS.withLia} />
                <Cell fill={STATUS_COLORS.withoutLia} />
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} studerande`, "Antal"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

type ProgressionData = {
  group: string;
  avgProgress: number;
};

type GroupProgressChartProps = {
  data: ProgressionData[];
};

export function GroupProgressChart({ data }: GroupProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Genomsnittlig progression per grupp</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="group" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Genomsnitt"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="avgProgress" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

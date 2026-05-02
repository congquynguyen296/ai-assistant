import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: Array<{ day: string; value: number }>;
};

export default function DashboardLearningPulse({ data }: Props) {
  return (
    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-sm font-semibold text-slate-900">Learning Pulse</div>
        <div className="text-xs font-semibold text-slate-500">This Week</div>
      </div>
      <div className="h-60 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 14, right: 18, bottom: 10, left: 8 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="6 6" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "rgba(16, 185, 129, 0.25)", strokeWidth: 2 }}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid rgba(226, 232, 240, 0.9)",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 700 }}
              itemStyle={{ color: "#0f766e", fontWeight: 700 }}
              formatter={(v: any) => [v, "Activities"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10b981", stroke: "#ecfdf5", strokeWidth: 3 }}
              activeDot={{ r: 6, fill: "#0f766e", stroke: "#ecfdf5", strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


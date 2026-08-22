"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type AutoChartProps = {
  data: Record<string, unknown>[];
};

export function AutoChart({ data }: AutoChartProps) {
  const chartConfig = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Analyze first row to find categories (strings) and values (numbers)
    const firstRow = data[0];
    let xAxisKey = "";
    const yAxisKeys: string[] = [];

    for (const [key, value] of Object.entries(firstRow)) {
      if (typeof value === "string" || typeof value === "boolean") {
        if (!xAxisKey) xAxisKey = key; // Pick first string as X axis
      } else if (typeof value === "number") {
        yAxisKeys.push(key);
      }
    }

    if (!xAxisKey && yAxisKeys.length > 0) {
      xAxisKey = Object.keys(firstRow)[0]; // Fallback to first key
    }

    if (!xAxisKey || yAxisKeys.length === 0) return null;

    // Decide chart type based on data length or axis keys
    const type = data.length > 15 ? "line" : "bar";

    return { type, xAxisKey, yAxisKeys };
  }, [data]);

  if (!chartConfig) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-amber-500/30 bg-black/80 px-4 py-3 shadow-xl backdrop-blur-md">
          <p className="mb-2 text-sm font-semibold text-emerald-400">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-xs text-white">
              <span className="opacity-70">{p.name}: </span>
              <span className="font-mono font-medium text-amber-400">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6 mb-2 rounded-2xl border border-emerald-500/20 bg-black/40 p-5 shadow-[inset_0_1px_2px_rgba(251,191,36,0.05),0_4px_12px_rgba(0,0,0,0.5)]">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-200/60">
        AI Visualized Data
      </h4>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartConfig.type === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fff" strokeOpacity={0.05} vertical={false} />
              <XAxis 
                dataKey={chartConfig.xAxisKey} 
                stroke="#fff" 
                strokeOpacity={0.3}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#fff" 
                strokeOpacity={0.3}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={i === 0 ? "#10B981" : "#F59E0B"} 
                  radius={[4, 4, 0, 0]} 
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fff" strokeOpacity={0.05} vertical={false} />
              <XAxis 
                dataKey={chartConfig.xAxisKey} 
                stroke="#fff" 
                strokeOpacity={0.3}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#fff" 
                strokeOpacity={0.3}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Line 
                  key={key} 
                  type="monotone"
                  dataKey={key} 
                  stroke={i === 0 ? "#10B981" : "#F59E0B"} 
                  strokeWidth={2}
                  dot={{ fill: '#000', stroke: i === 0 ? "#10B981" : "#F59E0B", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#F59E0B", stroke: "#000" }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

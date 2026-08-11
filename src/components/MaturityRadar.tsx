"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function MaturityRadar({
  data,
}: {
  data: Array<{ name: string; score: number }>;
}) {
  const chartData = data.map((d) => ({
    dimension: d.name.replace(" y ", " &\n"),
    short: d.name.split(" ")[0] === "Excelencia" ? "Operativa" : d.name.split(" ").slice(0, 2).join(" "),
    score: Math.round(d.score),
  }));

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#d8dee6" />
          <PolarAngleAxis dataKey="short" tick={{ fill: "#2B2F33", fontSize: 11, fontFamily: "Montserrat" }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#5c636a", fontSize: 10 }} />
          <Radar
            name="Madurez"
            dataKey="score"
            stroke="#0D1B3D"
            fill="#28A745"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value) => [`${value}/100`, "Madurez"]}
            contentStyle={{ borderRadius: 10, borderColor: "#d8dee6", fontFamily: "Montserrat" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

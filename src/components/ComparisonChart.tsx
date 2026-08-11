"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export function ComparisonChart({ data }: { data: Array<{ name: string; score: number }> }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8dee6" />
          <XAxis dataKey="name" tick={{ fontFamily: "Montserrat", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontFamily: "Montserrat", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 10, fontFamily: "Montserrat" }} />
          <ReferenceLine y={60} stroke="#d68910" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="score" name="Índice YANKOR" stroke="#0D1B3D" strokeWidth={3} dot={{ r: 5, fill: "#28A745" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./ActivityChart.module.css";

function shortDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function ActivityChart({ data }) {
  const chartData = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <div className={styles.panel}>
      <div className={styles.title}>Access Attempts — Last 7 Days</div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDotGranted} /> Granted
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDotDenied} /> Denied
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232938" vertical={false} />
          <XAxis dataKey="label" stroke="#5a6274" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#5a6274" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#181d28",
              border: "1px solid #232938",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e8ecf2" }}
          />
          <Bar dataKey="granted" fill="#34d399" radius={[4, 4, 0, 0]} />
          <Bar dataKey="denied" fill="#dc3b30" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

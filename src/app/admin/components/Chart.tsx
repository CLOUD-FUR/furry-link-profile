"use client";

import { useState } from "react";

type DataPoint = {
  label: string;
  value: number;
  value2: number;
};

const data: DataPoint[] = [
  { label: "1월", value: 42, value2: 28 },
  { label: "2월", value: 55, value2: 35 },
  { label: "3월", value: 48, value2: 32 },
  { label: "4월", value: 67, value2: 45 },
  { label: "5월", value: 73, value2: 52 },
  { label: "6월", value: 61, value2: 48 },
  { label: "7월", value: 85, value2: 60 },
  { label: "8월", value: 78, value2: 55 },
  { label: "9월", value: 92, value2: 68 },
  { label: "10월", value: 84, value2: 62 },
  { label: "11월", value: 95, value2: 72 },
  { label: "12월", value: 88, value2: 65 },
];

const TABS = [
  { key: "users", label: "사용자" },
  { key: "links", label: "링크" },
  { key: "visits", label: "방문" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Chart() {
  const [tab, setTab] = useState<TabKey>("users");
  const [hovered, setHovered] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.value2)));
  const chartHeight = 240;
  const barAreaHeight = 180;
  const width = 100; // percentage based

  // Build line path for value2 (overlay)
  const points = data.map((d, i) => {
    const x = (i + 0.5) * (width / data.length);
    const y = chartHeight - (d.value2 / maxVal) * barAreaHeight - 10;
    return { x, y };
  });
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">월별 성과</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            지난 12개월간의 핵심 지표 추이
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-indigo-500" />
              <span className="text-muted-foreground">신규</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-purple-500 bg-transparent" />
              <span className="text-muted-foreground">누적</span>
            </div>
      </div>

      {/* Chart */}
      <div className="relative mt-4">
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          className="h-[240px] w-full"
          style={{ overflow: "visible" }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => {
            const y = chartHeight - 10 - g * barAreaHeight;
            return (
              <line
                key={g}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth="0.2"
                strokeDasharray="0.5 0.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Area under line */}
          <path d={areaPath} className="fill-purple-500/10" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            className="stroke-purple-500"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 1.6 : 1}
              className="fill-purple-500 transition-all"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const barWidth = (width / data.length) * 0.5;
            const x = (i + 0.5) * (width / data.length) - barWidth / 2;
            const h = (d.value / maxVal) * barAreaHeight;
            const y = chartHeight - 10 - h;
            return (
              <g
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Hover hitbox */}
                <rect
                  x={(i * width) / data.length}
                  y="0"
                  width={width / data.length}
                  height={chartHeight}
                  fill="transparent"
                />
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx="0.8"
                  className={`fill-indigo-500 transition-opacity ${
                    hovered === null || hovered === i ? "opacity-100" : "opacity-40"
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* X labels */}
        <div className="mt-2 flex justify-between px-1 text-[10px] text-muted-foreground">
          {data.map((d, i) => (
            <span
              key={i}
              className={`flex-1 text-center transition-colors ${
                hovered === i ? "font-semibold text-foreground" : ""
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>

        {/* Tooltip */}
        {hovered !== null && (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${((hovered + 0.5) / data.length) * 100}%`,
            }}
          >
            <p className="mb-1 font-semibold">{data[hovered].label}</p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-indigo-500" />
              <span className="text-muted-foreground">신규:</span>
              <span className="font-medium">{data[hovered].value}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border border-purple-500" />
              <span className="text-muted-foreground">누적:</span>
              <span className="font-medium">{data[hovered].value2}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

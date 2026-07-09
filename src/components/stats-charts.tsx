"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type DayPoint = { date: string; clicks: number; profileVisits: number };
type TopLink = { id: string; title: string; platform: string; clicks: number };
type Series = { days: DayPoint[]; topLinks: TopLink[] };

function shortDate(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/30 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white shadow-soft backdrop-blur">
      <div className="opacity-70">{label ? shortDate(String(label)) : ""}</div>
      <div className="mt-0.5 tabular-nums">
        {Number(payload[0]?.value ?? 0).toLocaleString()}
        {unit}
      </div>
    </div>
  );
}

export function StatsCharts({ isDark, refreshKey }: { isDark: boolean; refreshKey?: unknown }) {
  const [series, setSeries] = useState<Series | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/timeseries")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.days) setSeries(d);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const uiText = isDark ? "text-white/90" : "text-slate-800";
  const uiSub = isDark ? "text-white/70" : "text-slate-700";
  const cardCls = clsx(
    "rounded-2xl border p-4",
    isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40"
  );
  const axisColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(51,65,85,0.65)";
  const gridColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(51,65,85,0.12)";

  const totals = useMemo(() => {
    if (!series) return { clicks: 0, profileVisits: 0 };
    return series.days.reduce(
      (acc, d) => ({ clicks: acc.clicks + d.clicks, profileVisits: acc.profileVisits + d.profileVisits }),
      { clicks: 0, profileVisits: 0 }
    );
  }, [series]);

  const maxTop = series?.topLinks[0]?.clicks ?? 0;

  if (failed) {
    return (
      <div className={clsx(cardCls, "text-sm", uiSub)}>
        📉 통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요!
      </div>
    );
  }

  if (!series) {
    return (
      <div className={clsx(cardCls, "text-sm animate-pulse", uiSub)}>
        📊 통계를 불러오는 중이에요...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 일별 프로필 방문 */}
      <div className={cardCls}>
        <div className="flex items-baseline justify-between gap-2">
          <div className={clsx("font-bold", uiText)}>일별 프로필 방문 (최근 30일)</div>
          <div className={clsx("text-xs tabular-nums", uiSub)}>
            합계 <b className={uiText}>{totals.profileVisits.toLocaleString()}</b>명
          </div>
        </div>
        <div className="mt-3 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series.days} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fontSize: 10, fill: axisColor }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip unit="명" />} cursor={{ stroke: gridColor }} />
              <Area type="monotone" dataKey="profileVisits" stroke="#8b5cf6" strokeWidth={2} fill="url(#fillVisits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 일별 링크 클릭 */}
      <div className={cardCls}>
        <div className="flex items-baseline justify-between gap-2">
          <div className={clsx("font-bold", uiText)}>일별 링크 클릭 (최근 30일)</div>
          <div className={clsx("text-xs tabular-nums", uiSub)}>
            합계 <b className={uiText}>{totals.clicks.toLocaleString()}</b>회
          </div>
        </div>
        <div className="mt-3 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series.days} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fontSize: 10, fill: axisColor }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip unit="회" />} cursor={{ fill: gridColor }} />
              <Bar dataKey="clicks" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 링크 랭킹 */}
      <div className={cardCls}>
        <div className={clsx("font-bold", uiText)}>Top 링크 (누적 클릭)</div>
        <div className="mt-3 space-y-2.5">
          {series.topLinks.length === 0 ? (
            <div className={clsx("text-sm", uiSub)}>아직 집계된 링크가 없어요!</div>
          ) : (
            series.topLinks.map((l, i) => (
              <div key={l.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className={clsx("truncate", uiSub)}>
                    <span className="mr-1.5" aria-hidden>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </span>
                    {l.title}
                  </span>
                  <b className={clsx("shrink-0 tabular-nums", uiText)}>{l.clicks.toLocaleString()}회</b>
                </div>
                <div className={clsx("mt-1 h-1.5 w-full overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-slate-900/10")}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-[width] duration-700"
                    style={{ width: maxTop > 0 ? `${Math.max(4, (l.clicks / maxTop) * 100)}%` : "0%" }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

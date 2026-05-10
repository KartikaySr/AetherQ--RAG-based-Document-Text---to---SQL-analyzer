import { NextResponse } from "next/server";

import { getAnalyticsDbPool } from "@/lib/dbPool";

export const runtime = "nodejs";

const SAFE_TOTAL_REVENUE = `
  SELECT COALESCE(SUM(revenue), 0)::numeric(16,2) AS total_revenue
  FROM sales
  LIMIT 1
`;

const SAFE_TOTAL_EMPLOYEES = `
  SELECT COUNT(*)::int AS employee_count FROM employees LIMIT 1
`;

const SAFE_LOW_STOCK = `
  SELECT COUNT(*)::int AS skus_below_reorder
  FROM inventory
  WHERE stock < reorder_level
  LIMIT 1
`;

const SAFE_AVG_FREIGHT = `
  SELECT COALESCE(AVG(freight_cost_usd), 0)::numeric(14,2) AS avg_freight_usd
  FROM logistics
  LIMIT 1
`;

const SAFE_REV_BY_QUARTER = `
  SELECT quarter AS label,
         COALESCE(SUM(revenue), 0)::numeric(16,2) AS total
  FROM sales
  GROUP BY quarter
  ORDER BY quarter ASC
`;

const SAFE_REV_BY_REGION = `
  SELECT region AS label,
         COALESCE(SUM(revenue), 0)::numeric(16,2) AS total
  FROM sales
  GROUP BY region
  ORDER BY total DESC NULLS LAST
  LIMIT 8
`;

const SAFE_HEADCOUNT = `
  SELECT d.name AS label,
         COUNT(e.id)::int AS total
  FROM departments d
  LEFT JOIN employees e ON e.department_id = d.id
  GROUP BY d.id, d.name
  ORDER BY total DESC NULLS LAST
  LIMIT 10
`;

export async function GET() {
  const pool = getAnalyticsDbPool();
  if (!pool) {
    return NextResponse.json(
      {
        error: "DATABASE_URL not configured.",
        kpis: null,
      },
      { status: 503 }
    );
  }

  try {
    const [
      revRow,
      empRow,
      lowStockRow,
      freightRow,
      qtrs,
      regions,
      depts,
    ] = await Promise.all([
      pool.query<{ total_revenue: string }>(SAFE_TOTAL_REVENUE),
      pool.query<{ employee_count: number }>(SAFE_TOTAL_EMPLOYEES),
      pool.query<{ skus_below_reorder: number }>(SAFE_LOW_STOCK),
      pool.query<{ avg_freight_usd: string }>(SAFE_AVG_FREIGHT),
      pool.query<{ label: string; total: string }>(SAFE_REV_BY_QUARTER),
      pool.query<{ label: string; total: string }>(SAFE_REV_BY_REGION),
      pool.query<{ label: string; total: number }>(SAFE_HEADCOUNT),
    ]);

    const kpis = {
      totalRevenue: revRow.rows[0]?.total_revenue ?? "0",
      employeeCount: empRow.rows[0]?.employee_count ?? 0,
      skusBelowReorder: lowStockRow.rows[0]?.skus_below_reorder ?? 0,
      avgFreightUsd: freightRow.rows[0]?.avg_freight_usd ?? "0",
      revenueByQuarter: qtrs.rows.map((r) => ({
        name: r.label,
        revenue: Number(r.total),
      })),
      revenueByRegion: regions.rows.map((r) => ({
        name: r.label,
        revenue: Number(r.total),
      })),
      headcountByDepartment: depts.rows.map((r) => ({
        name: r.label.slice(0, 18),
        people: r.total,
      })),
    };

    return NextResponse.json({ kpis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Summary query failed.";
    return NextResponse.json({ error: message, kpis: null }, { status: 500 });
  }
}

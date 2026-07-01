import { NextResponse } from "next/server";

import { createAuthErrorResponse, getUserFromRequest } from "@/lib/auth-helpers";
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

const DEMO_KPIS = {
  totalRevenue: "8425000.00",
  employeeCount: 248,
  skusBelowReorder: 7,
  avgFreightUsd: "1840.00",
  revenueByQuarter: [
    { name: "Q1", revenue: 1750000 },
    { name: "Q2", revenue: 2040000 },
    { name: "Q3", revenue: 2195000 },
    { name: "Q4", revenue: 2440000 },
  ],
  revenueByRegion: [
    { name: "North America", revenue: 3120000 },
    { name: "Europe", revenue: 2265000 },
    { name: "Asia Pacific", revenue: 1940000 },
    { name: "Middle East", revenue: 680000 },
    { name: "Latin America", revenue: 420000 },
  ],
  headcountByDepartment: [
    { name: "Engineering", people: 74 },
    { name: "Operations", people: 52 },
    { name: "Sales", people: 46 },
    { name: "Support", people: 33 },
    { name: "Finance", people: 22 },
    { name: "People", people: 21 },
  ],
};

export async function GET() {
  const { user } = await getUserFromRequest();
  if (!user) {
    return createAuthErrorResponse();
  }

  const pool = getAnalyticsDbPool();
  if (!pool) {
    return NextResponse.json({ kpis: DEMO_KPIS, demo: true });
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
    return NextResponse.json({
      kpis: DEMO_KPIS,
      demo: true,
      warning: message,
    });
  }
}

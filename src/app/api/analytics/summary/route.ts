import { authenticatedClient } from "@/lib/server/auth";
import { canUseWarehouse, readWarehouseQueries } from "@/lib/server/warehouse";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { user } = await authenticatedClient();
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
    if (!canUseWarehouse(user)) return Response.json({ error: "Ask your administrator to grant warehouse access." }, { status: 403 });
    const [totals,revenueByQuarter,revenueByRegion,headcountByDepartment] = await readWarehouseQueries([
      "SELECT (SELECT COALESCE(SUM(revenue),0) FROM public.sales) AS revenue,(SELECT COUNT(*) FROM public.employees) AS employees,(SELECT COUNT(*) FROM public.inventory WHERE stock<reorder_level) AS reorder,(SELECT COALESCE(AVG(freight_cost_usd),0) FROM public.logistics) AS freight",
      "SELECT quarter AS name,SUM(revenue) AS revenue FROM public.sales GROUP BY quarter ORDER BY quarter",
      "SELECT region AS name,SUM(revenue) AS revenue FROM public.sales GROUP BY region ORDER BY SUM(revenue) DESC",
      "SELECT d.name,COUNT(e.id) AS people FROM public.departments d LEFT JOIN public.employees e ON d.id=e.department_id GROUP BY d.name ORDER BY COUNT(e.id) DESC"
    ]);
    return Response.json({ kpis: { totalRevenue: String(totals[0].revenue), employeeCount: Number(totals[0].employees), skusBelowReorder: Number(totals[0].reorder), avgFreightUsd: String(totals[0].freight), revenueByQuarter: revenueByQuarter.map(r => ({...r, revenue: Number(r.revenue)})), revenueByRegion: revenueByRegion.map(r => ({...r, revenue: Number(r.revenue)})), headcountByDepartment: headcountByDepartment.map(r => ({...r, people: Number(r.people)})) } });
  } catch (error) {
    console.error("Analytics summary unavailable", error);
    return Response.json({ error: "Warehouse data is unavailable. Check the connection and database setup, then retry." }, { status: 503 });
  }
}

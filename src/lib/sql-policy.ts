import { parse } from "pgsql-ast-parser";

export const warehouseTables = ["departments", "employees", "sales", "logistics", "inventory"];
const functions = new Set(["count", "sum", "avg", "min", "max", "round", "coalesce", "nullif", "lower", "upper", "date_trunc", "date_part", "abs", "ceil", "floor"]);

/** Conservative subset: SELECT only, known relations and pure built-in functions. */
export function validateSql(input: string): string {
  const sql = input.trim().replace(/;$/, "");
  if (!sql || sql.length > 12000 || /\b(?:into|for\s+(?:update|share|no\s+key|key\s+share))\b/i.test(sql)) throw new Error("Invalid SQL length.");
  const statements = parse(sql);
  if (statements.length !== 1 || statements[0].type !== "select") throw new Error("Only a single SELECT is permitted.");
  function visit(value: unknown): void {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const node = value as Record<string, any>;
    if (["insert", "update", "delete", "with", "with recursive", "union", "union all"].includes(node.type) || node.into || node.for) throw new Error("Unsupported query operation.");
    if (node.type === "table") {
      if (!warehouseTables.includes(node.name?.name) || (node.name?.schema && node.name.schema !== "public")) throw new Error("Table is outside the analytics workspace.");
    }
    if (node.type === "call" && (!functions.has(node.function?.name?.toLowerCase()) || (node.function?.schema && node.function.schema !== "pg_catalog"))) throw new Error("Unsupported SQL function.");
    if (node.type === "cast") {
      const name = node.to?.name;
      if (!['text', 'integer', 'int', 'bigint', 'numeric', 'decimal', 'float', 'double precision', 'date', 'timestamp', 'timestamptz', 'boolean'].includes(name) || node.to?.schema) throw new Error("Unsupported SQL cast.");
    }
    Object.values(node).forEach(visit);
  }
  visit(statements);
  return sql;
}

-- =============================================================================
-- AetherQ Enterprise Analytics — schema + deterministic seeds (run in Supabase SQL)
-- Run after enabling extensions you already use. Safe to re-run: drops demo tables first.
-- =============================================================================

BEGIN;

-- Optional: uncomment if recreating cleanly in dev
DROP TABLE IF EXISTS public.query_audit_logs CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.logistics CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- -----------------------------------------------------------------------------
-- Departments
-- -----------------------------------------------------------------------------
CREATE TABLE public.departments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  cost_center TEXT NOT NULL,
  head_count_budget INT NOT NULL CHECK (head_count_budget >= 0),
  office_location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.departments (id, name, cost_center, head_count_budget, office_location) VALUES
  ('a1111111-1111-4111-8111-111111111101', 'Executive Office', 'CC-901', 20, 'San Francisco'),
  ('a1111111-1111-4111-8111-111111111102', 'Product Engineering', 'CC-402', 180, 'Austin'),
  ('a1111111-1111-4111-8111-111111111103', 'Infrastructure & Platform', 'CC-210', 95, 'Dublin'),
  ('a1111111-1111-4111-8111-111111111104', 'Growth & Revenue', 'CC-330', 140, 'New York'),
  ('a1111111-1111-4111-8111-111111111105', 'Customer Success', 'CC-455', 120, 'Singapore'),
  ('a1111111-1111-4111-8111-111111111106', 'Supply Chain Ops', 'CC-770', 75, 'Rotterdam'),
  ('a1111111-1111-4111-8111-111111111107', 'Corporate Finance', 'CC-603', 45, 'Chicago'),
  ('a1111111-1111-4111-8111-111111111108', 'People & Workplace', 'CC-804', 60, 'London'),
  ('a1111111-1111-4111-8111-111111111109', 'Security & Governance', 'CC-991', 40, 'Tel Aviv'),
  ('a1111111-1111-4111-8111-11111111110a', 'Legal & Ethics', 'CC-881', 30, 'Boston'),
  ('a1111111-1111-4111-8111-11111111110b', 'Research ML', 'CC-722', 55, 'Toronto'),
  ('a1111111-1111-4111-8111-11111111110c', 'APAC Expansion', 'CC-541', 90, 'Tokyo'),
  ('a1111111-1111-4111-8111-11111111110d', 'Manufacturing Partners', 'CC-673', 50, 'Detroit'),
  ('a1111111-1111-4111-8111-11111111110e', 'Healthcare Vertical', 'CC-744', 70, 'Nashville'),
  ('a1111111-1111-4111-8111-11111111110f', 'Public Sector', 'CC-955', 35, 'Washington DC');

-- -----------------------------------------------------------------------------
-- Employees
-- -----------------------------------------------------------------------------
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  salary NUMERIC(12, 2) NOT NULL CHECK (salary >= 0),
  department_id UUID NOT NULL REFERENCES public.departments (id) ON DELETE RESTRICT,
  location TEXT NOT NULL,
  joining_date DATE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.employees (name, role, salary, department_id, location, joining_date, email)
SELECT
  'Employee-' || LPAD(gs::TEXT, 3, '0'),
  roles[1 + ((gs + 7) % array_length(roles, 1))],
  (48000 + (gs * 1933) % 185000)::NUMERIC(12, 2),
  (SELECT id FROM public.departments ORDER BY name OFFSET ((gs - 1) % 15) LIMIT 1),
  offices[1 + ((gs + 3) % array_length(offices, 1))],
  DATE '2016-06-01' + ((gs * 71) % 3200)::INT,
  'emp' || gs || '@aetherq.enterprises'
FROM generate_series(1, 62) gs,
  LATERAL (SELECT ARRAY['IC Engineer','Team Lead','PM','Sales Executive','Solutions Architect','Finance Analyst','HR Partner','Compliance Officer','BizOps','Technical Writer']) AS r(roles),
  LATERAL (SELECT ARRAY['Remote','Singapore','Chicago','Paris','Mexico City','Bengaluru','Seattle']) AS o(offices);

CREATE INDEX idx_employees_department_id ON public.employees (department_id);
CREATE INDEX idx_employees_joining_date ON public.employees (joining_date);
CREATE INDEX idx_employees_salary ON public.employees (salary DESC NULLS LAST);

-- -----------------------------------------------------------------------------
-- Sales
-- -----------------------------------------------------------------------------
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  revenue NUMERIC(14, 2) NOT NULL CHECK (revenue >= 0),
  product TEXT NOT NULL,
  quarter TEXT NOT NULL,
  sales_rep TEXT NOT NULL,
  units_sold INT NOT NULL DEFAULT 1 CHECK (units_sold > 0),
  deal_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.sales (region, revenue, product, quarter, sales_rep, units_sold, deal_date)
SELECT
  regions[1 + ((sn - 1) % array_length(regions, 1))],
  (12050 + ((sn * 7919 + 413) % 890000))::NUMERIC,
  products[1 + ((sn + 5) % array_length(products, 1))],
  quarters[1 + ((sn - 1) % array_length(quarters, 1))],
  reps[1 + ((sn + 11) % array_length(reps, 1))],
  5 + ((sn * 17) % 220),
  DATE '2022-03-05' + ((sn * 53) % 1400)::INT
FROM generate_series(1, 62) sn,
  LATERAL (
    SELECT
      ARRAY['North America','LATAM','EMEA','India','APAC','Middle East','Africa Nord']::TEXT[]
  ) rg(regions),
  LATERAL (
    SELECT ARRAY['Athena Cloud','Nova Analytics','Polaris Ledger','Quantum HR','Spectrum CRM','Fusion IoT Suite']::TEXT[]
  ) pr(products),
  LATERAL (SELECT ARRAY['Q1','Q2','Q3','Q4']::TEXT[]) q(quarters),
  LATERAL (
    SELECT ARRAY['Jordan Lee','Priya Rao','Maria Santos','Oliver Chen','Taylor Brooks','Jamal Diop','Wei Zhang','Sasha Volkov','Noah Ibrahim','Grace Okafor']::TEXT[]
  ) rp(reps);

CREATE INDEX idx_sales_region ON public.sales (region);
CREATE INDEX idx_sales_quarter ON public.sales (quarter);
CREATE INDEX idx_sales_deal_date ON public.sales (deal_date);
CREATE INDEX idx_sales_product ON public.sales (product);

-- -----------------------------------------------------------------------------
-- Logistics
-- -----------------------------------------------------------------------------
CREATE TABLE public.logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref TEXT NOT NULL UNIQUE,
  origin_warehouse TEXT NOT NULL,
  destination_region TEXT NOT NULL,
  freight_cost_usd NUMERIC(12, 2) NOT NULL CHECK (freight_cost_usd >= 0),
  carrier TEXT NOT NULL,
  eta_days INT NOT NULL CHECK (eta_days BETWEEN 1 AND 60),
  status TEXT NOT NULL,
  departure_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.logistics (shipment_ref, origin_warehouse, destination_region, freight_cost_usd, carrier, eta_days, status, departure_date)
SELECT
  'SH-' || LPAD(li::TEXT, 5, '0'),
  wh[1 + ((li + 4) % array_length(wh, 1))],
  rg[1 + ((li + 9) % array_length(rg, 1))],
  (840 + ((li * 239) % 9800))::NUMERIC,
  car[1 + ((li + 2) % array_length(car, 1))],
  3 + ((li * 13) % 42),
  st[1 + ((li + 6) % array_length(st, 1))],
  DATE '2025-07-01' + ((li * 41) % 180)::INT
FROM generate_series(1, 58) li,
  LATERAL (SELECT ARRAY['DFW Fulfillment Hub','Chennai Logistics Park','Gdansk Consolidation Center','Mexico City Parcel Core']::TEXT[]) w(wh),
  LATERAL (SELECT ARRAY['DACH Retail','SEA Enterprise','Brazil SMB','GCC Energy','France Manufacturing']::TEXT[]) dest(rg),
  LATERAL (SELECT ARRAY['BlueJet Freight','Nimbus Express','EuroLink Maritime','Cascade Rail Partners']::TEXT[]) c(car),
  LATERAL (SELECT ARRAY['In Transit','Delivered','Exception','Warehouse Hold']::TEXT[]) s(st);

CREATE INDEX idx_logistics_status ON public.logistics (status);
CREATE INDEX idx_logistics_destination_region ON public.logistics (destination_region);

-- -----------------------------------------------------------------------------
-- Inventory
-- -----------------------------------------------------------------------------
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  stock INT NOT NULL,
  warehouse TEXT NOT NULL,
  reorder_level INT NOT NULL CHECK (reorder_level >= 0),
  unit_cost_usd NUMERIC(12, 4) NOT NULL CHECK (unit_cost_usd >= 0),
  last_restock_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.inventory (product_name, sku, stock, warehouse, reorder_level, unit_cost_usd, last_restock_at)
SELECT
  sku_names[1 + ((inv - 1) % array_length(sku_names, 1))],
  'AEQ-' || LPAD(inv::TEXT, 5, '0'),
  15 + ((inv * 97) % 4800),
  wh[1 + ((inv + 1) % array_length(wh, 1))],
  120 + ((inv * 31) % 600),
  (9.42 + ((inv % 850) / 100.0))::NUMERIC(12, 4),
  DATE '2025-02-08' + ((inv * 19) % 400)::INT
FROM generate_series(1, 58) inv,
  LATERAL (
    SELECT ARRAY[
      'EdgeCompute Node Mk II','HyperDisplay 32" Pro','FleetSense Sensor Pack','ThermalVault Cooling Unit','SecureBadge Enterprise','VoiceMesh Conference Hub'
    ]::TEXT[]
  ) pn(sku_names),
  LATERAL (SELECT ARRAY['DFW Fulfillment Hub','Chennai Logistics Park','Gdansk Consolidation Center','Mexico City Parcel Core']::TEXT[]) w(wh);

CREATE INDEX idx_inventory_warehouse_stock ON public.inventory (warehouse, stock);
CREATE INDEX idx_inventory_reorder ON public.inventory (stock, reorder_level);

-- -----------------------------------------------------------------------------
-- SQL audit logs (filled by Next.js api/sql when SUPABASE_SERVICE_ROLE_KEY is set)
-- -----------------------------------------------------------------------------
CREATE TABLE public.query_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_prompt TEXT NOT NULL,
  generated_sql TEXT NOT NULL,
  execution_status TEXT NOT NULL,
  response_time_ms INT,
  row_count INT,
  error_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_query_audit_logs_created ON public.query_audit_logs (created_at DESC);

COMMENT ON TABLE public.departments IS 'AetherQ demo enterprise departments';
COMMENT ON TABLE public.employees IS 'AetherQ demo HR / payroll aggregates';
COMMENT ON TABLE public.sales IS 'AetherQ demo revenue facts';
COMMENT ON TABLE public.logistics IS 'AetherQ demo shipments';
COMMENT ON TABLE public.inventory IS 'AetherQ demo stock ledger';

COMMIT;

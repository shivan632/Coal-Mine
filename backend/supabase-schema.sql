-- ============================================================================
-- COALGUARD AI: Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKERS TABLE
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    zone TEXT NOT NULL CHECK (zone IN ('Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face')),
    blood_group TEXT NOT NULL CHECK (blood_group IN ('O+', 'A+', 'B+', 'AB+', 'O-', 'B-', 'A-')),
    emergency_contact TEXT NOT NULL,
    shift_start_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    max_shift_minutes INTEGER NOT NULL DEFAULT 480,
    photo_url TEXT,
    active_underground BOOLEAN NOT NULL DEFAULT true,
    last_scanned TIMESTAMPTZ DEFAULT NOW(),
    ppe_compliance JSONB NOT NULL DEFAULT '{"helmet": true, "safetyJacket": true, "respiratorMask": true, "steelBoots": true, "gloves": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('NOMINAL', 'WARNING', 'CRITICAL')),
    zone TEXT NOT NULL CHECK (zone IN ('Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    regulatory_clause TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('PPE_VIOLATION', 'GAS_LEAK', 'THERMAL_RISK', 'PRESSURE_DROP', 'EVACUATION')),
    mitigation_step TEXT NOT NULL,
    supervisor_signature JSONB,
    telemetry_snapshot JSONB,
    worker_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TELEMETRY TABLE (Time-Series Sensor Readings)
CREATE TABLE IF NOT EXISTS public.telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id TEXT NOT NULL,
    zone TEXT NOT NULL CHECK (zone IN ('Shaft-01', 'Tunnel-A04', 'Gas-Zone-B12', 'Conveyor-C02', 'Excavation-Face')),
    depth_meters NUMERIC NOT NULL,
    methane_ch4 NUMERIC NOT NULL,
    carbon_monoxide_co NUMERIC NOT NULL,
    temperature NUMERIC NOT NULL,
    humidity NUMERIC NOT NULL,
    pressure NUMERIC NOT NULL,
    oxygen_o2 NUMERIC NOT NULL,
    air_velocity_ms NUMERIC NOT NULL,
    air_quality_index NUMERIC NOT NULL,
    atex_zone TEXT NOT NULL CHECK (atex_zone IN ('ATEX Zone 0', 'ATEX Zone 1', 'ATEX Zone 2')),
    section_power_state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (section_power_state IN ('ACTIVE', 'CUTOFF')),
    ventilation_fan_state TEXT NOT NULL DEFAULT 'NORMAL' CHECK (ventilation_fan_state IN ('NORMAL', 'OVERDRIVE', 'OFFLINE')),
    status TEXT NOT NULL DEFAULT 'NOMINAL' CHECK (status IN ('NOMINAL', 'WARNING', 'CRITICAL')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SCAN LOGS TABLE (AI Computer Vision Access Scans)
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id TEXT NOT NULL,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    confidence NUMERIC NOT NULL,
    helmet BOOLEAN NOT NULL,
    safety_jacket BOOLEAN NOT NULL,
    respirator_mask BOOLEAN NOT NULL,
    steel_boots BOOLEAN NOT NULL,
    gloves BOOLEAN NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('ALL CORRECT', 'SOMETHING IS MISSING!')),
    missing_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    turnstile_state TEXT NOT NULL CHECK (turnstile_state IN ('LOCKED', 'UNLOCKED')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_workers_worker_id ON public.workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_workers_zone ON public.workers(zone);
CREATE INDEX IF NOT EXISTS idx_workers_active ON public.workers(active_underground);

CREATE INDEX IF NOT EXISTS idx_incidents_incident_id ON public.incidents(incident_id);
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_zone ON public.incidents(zone);
CREATE INDEX IF NOT EXISTS idx_incidents_ack ON public.incidents(acknowledged);

CREATE INDEX IF NOT EXISTS idx_telemetry_zone_ts ON public.telemetry(zone, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_ts ON public.telemetry(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_scan_logs_worker ON public.scan_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_ts ON public.scan_logs(timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated and service roles, and read for anon
CREATE POLICY "Allow public read access on workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow service/anon write on workers" ON public.workers FOR ALL USING (true);

CREATE POLICY "Allow public read access on incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow service/anon write on incidents" ON public.incidents FOR ALL USING (true);

CREATE POLICY "Allow public read access on telemetry" ON public.telemetry FOR SELECT USING (true);
CREATE POLICY "Allow service/anon write on telemetry" ON public.telemetry FOR ALL USING (true);

CREATE POLICY "Allow public read access on scan_logs" ON public.scan_logs FOR SELECT USING (true);
CREATE POLICY "Allow service/anon write on scan_logs" ON public.scan_logs FOR ALL USING (true);

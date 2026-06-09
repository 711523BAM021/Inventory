"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Thermometer, Droplets, Activity, Cpu, AlertTriangle, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Sensor {
  id: number;
  type: string;
  value: number;
  status: string;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  health_score: number;
  installation_date: string;
  warehouse: string;
  sensors: Sensor[];
}

const fallbackAssets: Asset[] = [
  { id: 1, name: "HVAC Unit Wh-1 Line-1", type: "HVAC Unit", status: "OPERATIONAL", health_score: 0.94, installation_date: "2024-03-12", warehouse: "Chicago Distribution Hub 1", sensors: [{ id: 1, type: "Temperature", value: 18.5, status: "OK" }, { id: 2, type: "Humidity", value: 45.2, status: "OK" }] },
  { id: 2, name: "Cold Storage Bay Wh-1 Line-2", type: "Cold Storage Bay", status: "WARNING", health_score: 0.78, installation_date: "2023-08-20", warehouse: "Chicago Distribution Hub 1", sensors: [{ id: 3, type: "Temperature", value: 4.8, status: "WARNING" }, { id: 4, type: "Humidity", value: 68.4, status: "OK" }] },
  { id: 3, name: "Automated Conveyor Wh-2 Line-1", type: "Automated Conveyor", status: "OPERATIONAL", health_score: 0.98, installation_date: "2025-01-15", warehouse: "Houston Distribution Hub 2", sensors: [{ id: 5, type: "Vibration", value: 0.45, status: "OK" }] },
  { id: 4, name: "Lithium Forklift Wh-3 Line-1", type: "Lithium Forklift", status: "OPERATIONAL", health_score: 0.89, installation_date: "2024-11-02", warehouse: "Los Angeles Distribution Hub 3", sensors: [{ id: 6, type: "Vibration", value: 1.2, status: "OK" }] }
];

const telemetryHistory = [
  { time: "09:00", temp: 4.1, hum: 55 },
  { time: "09:10", temp: 4.2, hum: 56 },
  { time: "09:20", temp: 4.5, hum: 60 },
  { time: "09:30", temp: 4.7, hum: 65 },
  { time: "09:40", temp: 4.8, hum: 68.4 },
];

export default function InfrastructureIntelligence() {
  const [assets, setAssets] = useState<Asset[]>(fallbackAssets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/infrastructure");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAssets(data);
          }
        }
      } catch (err) {
        console.warn("Using offline infrastructure assets");
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text">Warehouse Infrastructure Telemetry & Diagnostics</h2>
          <p className="text-sm text-muted">Real-time tracking of HVACs, cooling systems, and material conveyors via IoT sensors.</p>
        </div>

        {/* Telemetry charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Telemetry chart */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
            <h3 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">Cold Room Temperature Profile (Wh-1 Bay 2)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="°C" />
                  <Tooltip />
                  <Area type="monotone" dataKey="temp" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly predictions list */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-heading font-bold text-text mb-4 uppercase tracking-wider">AI Anomaly Analysis</h3>
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex gap-2">
                  <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800">Cold Room Sensor Alert</h4>
                    <p className="text-[11px] text-amber-700 mt-0.5">Chicago Bay 2 temp spiked to 4.8°C. Condenser check recommended.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-2">
                  <ShieldCheck className="text-primary shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800">Conveyor Vibrations Safe</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Houston conveyer line-1 is operating in healthy margins (0.45G).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assets telemetry grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="p-2.5 bg-blue-50 text-secondary rounded-xl">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text">{asset.name}</h4>
                    <span className="text-[10px] text-muted block mt-0.5">{asset.warehouse}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  asset.status === "OPERATIONAL" ? "bg-emerald-50 text-primary" : "bg-amber-50 text-amber-600"
                }`}>
                  {asset.status}
                </span>
              </div>

              {/* Health Score Progress */}
              <div className="mt-6 space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted">Operational Health</span>
                  <span className={asset.health_score > 0.85 ? "text-primary" : "text-amber-600"}>
                    {Math.round(asset.health_score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden border border-border">
                  <div 
                    className={`h-full rounded-full ${asset.health_score > 0.85 ? "bg-[#10B981]" : "bg-amber-500"}`}
                    style={{ width: `${asset.health_score * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Live Telemetry Sensor Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {asset.sensors.map((s) => (
                  <div key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-border text-xs font-semibold text-[#0F172A]">
                    {s.type === "Temperature" && <Thermometer size={14} className="text-blue-500" />}
                    {s.type === "Humidity" && <Droplets size={14} className="text-teal-500" />}
                    {s.type === "Vibration" && <Activity size={14} className="text-purple-500" />}
                    <span>{s.type}: {s.value}{s.type === "Temperature" ? "°C" : s.type === "Humidity" ? "%" : "G"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

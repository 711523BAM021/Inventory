"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TrendingUp, ShoppingBag, ArrowUpRight, HelpCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ForecastItem {
  id: number;
  sku: string;
  name: string;
  forecast_date: string;
  predicted_demand: number;
  confidence_interval: number;
}

const fallbackForecasts: ForecastItem[] = [
  { id: 1, sku: "COLD-100421", name: "Thermal Medical Serum Pack B", forecast_date: "2026-06-16", predicted_demand: 520, confidence_interval: 0.95 },
  { id: 2, sku: "ELEC-100234", name: "Precision Microcontroller Module v3", forecast_date: "2026-06-16", predicted_demand: 1450, confidence_interval: 0.95 },
  { id: 3, sku: "AUTO-100871", name: "Heavy-Duty Hydraulic Pump", forecast_date: "2026-06-16", predicted_demand: 210, confidence_interval: 0.95 },
  { id: 4, sku: "CHEM-100551", name: "Vapor-Tight Chemical Reagent Box", forecast_date: "2026-06-16", predicted_demand: 640, confidence_interval: 0.95 }
];

const projectionTimeline = [
  { week: "Wk 24 (Current)", actual: 380, predicted: 380 },
  { week: "Wk 25", predicted: 420 },
  { week: "Wk 26", predicted: 490 },
  { week: "Wk 27", predicted: 510 },
  { week: "Wk 28", predicted: 520 }
];

export default function DemandForecasting() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>(fallbackForecasts);

  useEffect(() => {
    async function fetchForecasts() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/forecasts");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setForecasts(data);
          }
        }
      } catch (err) {
        console.warn("Using offline demand forecasts");
      }
    }
    fetchForecasts();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text">Demand Forecasting & safety limits</h2>
          <p className="text-sm text-muted">Leverage historical transactions and trend parameters to predict restock schedules.</p>
        </div>

        {/* Projection chart */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">Weekly Aggregate Demand Forecast Profile</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="dashed" dataKey="predicted" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast recommendations list */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-[#F8FAFC]">
            <h3 className="text-xs font-heading font-bold text-text uppercase tracking-wider">Safety Stock Optimization Prompts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-border text-muted font-bold">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Target Date</th>
                  <th className="p-4 text-right">Predicted Demand</th>
                  <th className="p-4 text-right">Confidence Level</th>
                  <th className="p-4">AI Procurement Call</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => (
                  <tr key={f.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-secondary">{f.sku}</td>
                    <td className="p-4 font-semibold text-text">{f.name}</td>
                    <td className="p-4 text-muted">{f.forecast_date}</td>
                    <td className="p-4 text-right font-medium">{f.predicted_demand.toLocaleString()} units</td>
                    <td className="p-4 text-right font-medium text-emerald-600">{Math.round(f.confidence_interval * 100)}%</td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-[#2563EB] font-bold">
                        <ShoppingBag size={12} />
                        Auto Reorder Triggered
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

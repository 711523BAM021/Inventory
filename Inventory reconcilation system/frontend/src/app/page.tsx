"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  TrendingUp, AlertTriangle, ShieldCheck, DollarSign, 
  Warehouse, Sparkles, Server, ArrowUpRight, ArrowDownRight, Truck 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, Cell 
} from "recharts";

interface Stats {
  total_inventory_value: number;
  total_skus: number;
  active_discrepancies: number;
  accuracy_percent: number;
  financial_impact: number;
  supplier_health_index: number;
  infrastructure_health_index: number;
}

const fallbackStats: Stats = {
  total_inventory_value: 48592100.00,
  total_skus: 100000,
  active_discrepancies: 34,
  accuracy_percent: 98.45,
  financial_impact: 184500.00,
  supplier_health_index: 92.4,
  infrastructure_health_index: 96.8
};

const accuracyData = [
  { month: "Jan", accuracy: 97.2 },
  { month: "Feb", accuracy: 97.5 },
  { month: "Mar", accuracy: 97.9 },
  { month: "Apr", accuracy: 98.1 },
  { month: "May", accuracy: 98.3 },
  { month: "Jun", accuracy: 98.45 },
];

const discrepancyByCategory = [
  { name: "Electronics", count: 12, value: 84000 },
  { name: "Cold Chain", count: 8, value: 52000 },
  { name: "Automotive", count: 6, value: 29000 },
  { name: "Chemicals", count: 5, value: 14500 },
  { name: "Consumables", count: 3, value: 5000 },
];

export default function ExecutiveCommandCenter() {
  const [stats, setStats] = useState<Stats>(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.warn("Using offline stats mock data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Quick Intro Row */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted font-medium">SYSTEM PERFORMANCE OVERVIEW</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-heading font-bold text-text">Welcome back, Director</h2>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <Sparkles size={12} />
              AI Reconciliation Agent Completed 4m ago
            </div>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Value */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted tracking-wider uppercase">Inventory Capitalization</span>
              <div className="p-2 rounded-xl bg-blue-50 text-secondary">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-heading font-bold text-text">
                {formatCurrency(stats.total_inventory_value)}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
                <ArrowUpRight size={14} />
                <span>+2.4% vs last week</span>
              </div>
            </div>
          </div>

          {/* Card 2: Accuracy */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted tracking-wider uppercase">Reconciliation Accuracy</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-primary">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-heading font-bold text-text">
                {stats.accuracy_percent}%
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
                <ArrowUpRight size={14} />
                <span>+0.8% accuracy recovery</span>
              </div>
            </div>
          </div>

          {/* Card 3: Active Discrepancies */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted tracking-wider uppercase">Open Discrepancies</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-heading font-bold text-text">
                {stats.active_discrepancies} SKUs
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600 font-semibold">
                <ArrowDownRight size={14} />
                <span>-{stats.active_discrepancies > 0 ? "12" : "0"} resolved by agent run</span>
              </div>
            </div>
          </div>

          {/* Card 4: Financial Loss / Variance Impact */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted tracking-wider uppercase">Financial Variance</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-heading font-bold text-rose-600">
                -{formatCurrency(stats.financial_impact)}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
                <span>94% auto-resolve confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Accuracy Chart */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
            <h4 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">Inventory Record Accuracy Trend</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[95, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
                  <Area type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mismatch breakdown by Category */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">Variance by Category</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discrepancyByCategory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value, name) => [name === "value" ? formatCurrency(value as number) : value, name === "value" ? "Financial Value" : "SKUs"]} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]}>
                    {discrepancyByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2563EB" : "#10B981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Intelligence Status Row (Supplier & Infrastructure) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Supplier Block */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Supplier Intelligence</span>
              <h4 className="text-2xl font-heading font-bold text-text">{stats.supplier_health_index}% Quality Index</h4>
              <p className="text-xs text-muted">All active POs are tracked by supply chain delay predictive agents.</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 text-primary flex items-center gap-1 font-bold text-lg">
              <Truck size={24} />
            </div>
          </div>

          {/* Infrastructure Block */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Infrastructure Telemetry</span>
              <h4 className="text-2xl font-heading font-bold text-text">{stats.infrastructure_health_index}% Operational Health</h4>
              <p className="text-xs text-muted">Vibration & cold room HVAC status analyzed in real-time.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 text-secondary flex items-center gap-1 font-bold text-lg">
              <Server size={24} />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

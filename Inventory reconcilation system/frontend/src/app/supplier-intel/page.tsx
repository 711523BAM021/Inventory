"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Truck, Star, Award, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Supplier {
  id: number;
  name: string;
  code: string;
  contact_email: string;
  delivery_performance: number;
  quality_score: number;
  lead_time_days: number;
  risk_score: number;
}

const fallbackSuppliers: Supplier[] = [
  { id: 1, name: "Apex Logistics & Supplies", code: "SUPP-10001", contact_email: "info@apex.com", delivery_performance: 0.96, quality_score: 0.98, lead_time_days: 4, risk_score: 0.04 },
  { id: 2, name: "Globex Supply Chain Solutions", code: "SUPP-10002", contact_email: "orders@globex.com", delivery_performance: 0.88, quality_score: 0.92, lead_time_days: 6, risk_score: 0.15 },
  { id: 3, name: "Pinnacle Tech Components", code: "SUPP-10003", contact_email: "sales@pinnacletech.com", delivery_performance: 0.94, quality_score: 0.95, lead_time_days: 5, risk_score: 0.08 },
  { id: 4, name: "Titan Industrial Products", code: "SUPP-10004", contact_email: "contact@titanind.com", delivery_performance: 0.76, quality_score: 0.84, lead_time_days: 12, risk_score: 0.38 }
];

export default function SupplierIntelligence() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(fallbackSuppliers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/suppliers");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSuppliers(data);
          }
        }
      } catch (err) {
        console.warn("Using offline supplier analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchSuppliers();
  }, []);

  const chartData = suppliers.map(s => ({
    name: s.name.split(" ")[0],
    "On-Time Delivery": Math.round(s.delivery_performance * 100),
    "Quality Score": Math.round(s.quality_score * 100)
  }));

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text">Supplier Compliance & Delay Intelligence</h2>
          <p className="text-sm text-muted">Monitor supplier quality scores, delivery lead-times, and calculated risk ratios.</p>
        </div>

        {/* Charts row */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">On-Time Performance vs Quality Indices</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
                <Tooltip />
                <Bar dataKey="On-Time Delivery" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Quality Score" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier cards block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="p-2.5 bg-blue-50 text-secondary rounded-xl">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text">{s.name}</h4>
                    <span className="text-[10px] text-muted block mt-0.5">{s.code} • {s.contact_email}</span>
                  </div>
                </div>
                {s.risk_score > 0.25 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                    <ShieldAlert size={12} />
                    High Risk
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-primary text-[10px] font-bold">
                    <Award size={12} />
                    Preferred
                  </span>
                )}
              </div>

              {/* Progress metrics */}
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">On-Time Performance</span>
                    <span>{Math.round(s.delivery_performance * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${s.delivery_performance * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">Quality Index</span>
                    <span>{Math.round(s.quality_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${s.quality_score * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

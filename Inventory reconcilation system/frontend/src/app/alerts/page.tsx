"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { AlertCircle, AlertTriangle, Info, BellRing, CheckCircle2 } from "lucide-react";

interface AlertItem {
  id: number;
  severity: string;
  type: string;
  message: string;
  timestamp: string;
  warehouse: string;
}

const fallbackAlerts: AlertItem[] = [
  { id: 1, severity: "Critical", type: "Infrastructure", message: "Critical telemetry anomaly: Chicago Bay 2 freezer temp breached safe bounds (4.8°C vs 4°C target limit)", timestamp: "2026-06-09T09:42:00", warehouse: "Chicago Distribution Hub 1" },
  { id: 2, severity: "Warning", type: "Supplier", message: "Supplier delay forecast: PO-10298 delivery lead time predicted to slip by 3 days from Titan Industrial", timestamp: "2026-06-09T09:41:00", warehouse: "Seattle Distribution Hub 5" },
  { id: 3, severity: "Warning", type: "Inventory", message: "Inventory Stock Mismatch: Heavy-Duty Hydraulic Pump (SKU: AUTO-100871) quantity discrepancy of 10 units flagged", timestamp: "2026-06-09T09:40:00", warehouse: "Denver Distribution Hub 7" }
];

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<AlertItem[]>(fallbackAlerts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/alerts");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAlerts(data);
          }
        }
      } catch (err) {
        console.warn("Using offline alert database");
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text">Platform Alert & Notification Center</h2>
            <p className="text-sm text-muted">Proactive notifications triggered by telemetry alarms and inventory variances.</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl relative">
            <BellRing size={20} className="animate-swing" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
              {alerts.length}
            </span>
          </div>
        </div>

        {/* Alerts Stack */}
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "Critical";
            return (
              <div 
                key={alert.id}
                className={`p-6 rounded-2xl border flex gap-4 items-start shadow-sm transition-shadow hover:shadow-md ${
                  isCritical 
                    ? "bg-red-50/50 border-red-100 text-red-900" 
                    : "bg-amber-50/50 border-amber-100 text-amber-900"
                }`}
              >
                {isCritical ? (
                  <AlertCircle size={22} className="text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCritical ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {alert.severity} • {alert.type}
                      </span>
                      <span className="text-[10px] text-muted font-semibold">{alert.warehouse}</span>
                    </div>
                    <span className="text-[10px] text-muted">{alert.timestamp.split("T")[1]?.slice(0, 5) || "09:40"}</span>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="pt-2 flex gap-2">
                    <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                      isCritical ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}>
                      Investigate Discrepancy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}

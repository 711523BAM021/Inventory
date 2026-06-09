"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Download, AlertTriangle, Check, RefreshCcw, HelpCircle } from "lucide-react";

interface ReconRecord {
  id: number;
  run_id: string;
  sku: string;
  name: string;
  erp_qty: number;
  wms_qty: number;
  physical_qty: number;
  variance: number;
  financial_impact: number;
  root_cause: string;
  status: string;
  timestamp: string;
}

const fallbackRecons: ReconRecord[] = [
  { id: 1, run_id: "run-421", sku: "COLD-100421", name: "Thermal Medical Serum Pack B", erp_qty: 450, wms_qty: 450, physical_qty: 450, variance: 0, financial_impact: 0.0, root_cause: "Synced", status: "RESOLVED", timestamp: "2026-06-09T09:40:00" },
  { id: 2, run_id: "run-421", sku: "AUTO-100871", name: "Heavy-Duty Hydraulic Pump", erp_qty: 180, wms_qty: 170, physical_qty: 170, variance: 10, financial_impact: 3200.00, root_cause: "Damaged during receiving dock inspection", status: "PENDING", timestamp: "2026-06-09T09:40:00" },
  { id: 3, run_id: "run-421", sku: "CHEM-100551", name: "Vapor-Tight Chemical Reagent Box", erp_qty: 600, wms_qty: 600, physical_qty: 580, variance: 20, financial_impact: 1900.00, root_cause: "Misplaced in storage rack bin", status: "PENDING", timestamp: "2026-06-09T09:40:00" }
];

export default function ReconciliationCenter() {
  const [recons, setRecons] = useState<ReconRecord[]>(fallbackRecons);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchRecons() {
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter !== "All") {
          queryParams.append("status", statusFilter.toUpperCase());
        }
        const res = await fetch(`http://localhost:8000/api/v1/inventory/reconciliation?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setRecons(data);
          }
        }
      } catch (err) {
        console.warn("Using offline reconciliation records");
      } finally {
        setLoading(false);
      }
    }
    fetchRecons();
  }, [statusFilter]);

  const handleExport = () => {
    window.open("http://localhost:8000/api/v1/inventory/export?format=csv", "_blank");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text">Reconciliation Management Center</h2>
            <p className="text-sm text-muted font-medium">Compare ERP inventories vs WMS stocks vs Physical cycle audits.</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border text-xs font-bold text-text rounded-xl shadow-sm hover:bg-[#F8FAFC] transition-colors"
          >
            <Download size={14} />
            <span>Export CSV Audit Ledger</span>
          </button>
        </div>

        {/* Filter Widget */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "All" ? "bg-secondary text-white" : "text-muted hover:text-text"
              }`}
            >
              All Discrepancies
            </button>
            <button
              onClick={() => setStatusFilter("Pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "Pending" ? "bg-secondary text-white" : "text-muted hover:text-text"
              }`}
            >
              Open Pending
            </button>
            <button
              onClick={() => setStatusFilter("Resolved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "Resolved" ? "bg-secondary text-white" : "text-muted hover:text-text"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Audit / Reconciliation table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-border text-muted font-bold">
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4 text-right">ERP count</th>
                  <th className="p-4 text-right">WMS count</th>
                  <th className="p-4 text-right">Audited count</th>
                  <th className="p-4 text-right">Variance</th>
                  <th className="p-4 text-right">Loss Valuation</th>
                  <th className="p-4">AI Diagnosed Root Cause</th>
                  <th className="p-4">Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {recons.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-secondary">{r.sku}</td>
                    <td className="p-4 font-semibold text-text">{r.name}</td>
                    <td className="p-4 text-right font-medium text-muted">{r.erp_qty}</td>
                    <td className="p-4 text-right font-medium text-muted">{r.wms_qty}</td>
                    <td className="p-4 text-right font-bold">{r.physical_qty}</td>
                    <td className="p-4 text-right font-bold text-rose-600">
                      {r.variance > 0 ? `+${r.variance}` : r.variance}
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600">
                      {formatCurrency(r.financial_impact)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium text-text bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 max-w-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                        <span className="truncate">{r.root_cause}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                        r.status === "RESOLVED"
                          ? "bg-emerald-50 text-primary"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {r.status === "RESOLVED" ? <Check size={12} /> : <AlertTriangle size={12} />}
                        {r.status}
                      </span>
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

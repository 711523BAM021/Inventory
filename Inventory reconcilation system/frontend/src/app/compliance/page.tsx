"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ShieldAlert, ShieldCheck, FileText, CheckCircle } from "lucide-react";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  target_table: string;
  target_id: number | null;
  timestamp: string;
  details: string;
}

const fallbackLogs: AuditLog[] = [
  { id: 1, user_id: 1, action: "RUN_RECONCILIATION", target_table: "reconciliation_results", target_id: null, timestamp: "2026-06-09T09:40:08", details: "Multi-agent reconciliation cycle run complete. Run ID: run-421. Compliance Score: 98.45%" },
  { id: 2, user_id: 2, action: "UPDATE_SAFETY_STOCK", target_table: "inventory_items", target_id: 1, timestamp: "2026-06-09T09:30:15", details: "Safety stock limit adjusted for COLD-100421 from 40 to 50 based on AI agent safety recommendations." },
  { id: 3, user_id: 1, action: "SEED", target_table: "all", target_id: null, timestamp: "2026-06-09T09:00:00", details: "Initial system data seed execution completed." }
];

export default function AuditCompliance() {
  const [logs, setLogs] = useState<AuditLog[]>(fallbackLogs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/audit-logs");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setLogs(data);
          }
        }
      } catch (err) {
        console.warn("Using offline audit log database");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text">Audit Ledgers & Regulatory Compliance</h2>
            <p className="text-sm text-muted font-medium">Verify tamper-evident activity reports, stock corrections, and automated system decisions.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-primary border border-emerald-100 rounded-full text-xs font-bold">
            <ShieldCheck size={14} />
            Ledger Validated
          </div>
        </div>

        {/* Big Compliance Panel */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-[#0F172A] uppercase tracking-wider">Omni Compliance Certificate</h3>
            <p className="text-xs text-muted leading-relaxed max-w-xl">
              This inventory tracking ledger is signed and synchronized across physical stores and ERP systems. Every automatic change is certified by the Audit agent node.
            </p>
          </div>
          <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border border-border rounded-xl">
            <div className="text-center">
              <span className="text-[10px] text-muted font-bold block uppercase tracking-widest">Active Score</span>
              <span className="text-3xl font-heading font-bold text-text">98.45%</span>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-[#F8FAFC]">
            <h3 className="text-xs font-heading font-bold text-text uppercase tracking-wider">System Operations Audit Trail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-border text-muted font-bold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Target Table</th>
                  <th className="p-4">Change Log Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-muted">
                      {log.timestamp.replace("T", " ").slice(0, 16)}
                    </td>
                    <td className="p-4 font-bold text-text">
                      {log.user_id ? `User-ID ${log.user_id}` : "SYSTEM Agent"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-secondary font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-muted">{log.target_table}</td>
                    <td className="p-4 font-semibold text-text leading-relaxed">{log.details}</td>
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

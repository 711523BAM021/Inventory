"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Bot, RefreshCw, Layers, ShieldCheck, Cpu, Code, ArrowRight } from "lucide-react";

interface AgentLog {
  id: number;
  run_id: string;
  agent_name: string;
  status: string;
  reasoning: string;
  tool_calls: any;
  confidence: number;
  timestamp: string;
}

const fallbackHistory: AgentLog[] = [
  { id: 1, run_id: "run-421", agent_name: "Reconciliation Agent", status: "COMPLETED", reasoning: "Scanned 100k items. Located 34 stock level mismatch events between ERP Ledger counts and WMS records.", tool_calls: [{ name: "db_compare_qty", result: "34 mismatches flagged" }], confidence: 0.98, timestamp: "2026-06-09T09:40:00" },
  { id: 2, run_id: "run-421", agent_name: "Root Cause Agent", status: "COMPLETED", reasoning: "Correlated receipt dates and shipment records. Determined that 12 mismatches originate from dock handling damage.", tool_calls: [{ name: "analyze_transaction_logs", result: "12 dock damage, 22 warehouse storage slips" }], confidence: 0.88, timestamp: "2026-06-09T09:40:02" },
  { id: 3, run_id: "run-421", agent_name: "Supplier Intelligence Agent", status: "COMPLETED", reasoning: "Assessed vendor lead times. Flagged Titan Industrial for delay probabilities due to standard lead deviation.", tool_calls: [{ name: "query_supplier_profiles", result: "1 vendor flagged" }], confidence: 0.90, timestamp: "2026-06-09T09:40:03" },
  { id: 4, run_id: "run-421", agent_name: "Infrastructure Agent", status: "COMPLETED", reasoning: "Analyzed environmental streams. Flagged Chicago Bay 2 freezer sensor warnings (4.8°C vs 4°C limit).", tool_calls: [{ name: "scan_telemetry_streams", result: "1 cold chain anomaly detected" }], confidence: 0.94, timestamp: "2026-06-09T09:40:05" },
  { id: 5, run_id: "run-421", agent_name: "Forecast Agent", status: "COMPLETED", reasoning: "Recalculated safety levels. Recommended restock adjustments on 10 SKUs showing immediate safety margin drops.", tool_calls: [{ name: "compute_demand_trends", result: "Safety targets updated" }], confidence: 0.87, timestamp: "2026-06-09T09:40:06" },
  { id: 6, run_id: "run-421", agent_name: "Audit Agent", status: "COMPLETED", reasoning: "Verified signatures. Logged full execution logs onto the ledger. Combined accuracy compliance: 98.45%.", tool_calls: [{ name: "compile_compliance_ledger", result: "Ledger entry signed" }], confidence: 0.99, timestamp: "2026-06-09T09:40:08" }
];

export default function AgentsControlCenter() {
  const [history, setHistory] = useState<AgentLog[]>(fallbackHistory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/agents/history");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setHistory(data);
          }
        }
      } catch (err) {
        console.warn("Using offline agent history logs");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text">AI Agents Orchestration Control Center</h2>
          <p className="text-sm text-muted">Visualize the active LangGraph nodes, agent logic, tool executions, and audit records.</p>
        </div>

        {/* Visual LangGraph Node Graph Path */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">Active LangGraph Multi-Agent Sequence</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 bg-[#F8FAFC] rounded-2xl border border-border overflow-x-auto">
            
            {/* Node 1: Reconciliation */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-border w-40 text-center shadow-sm shrink-0">
              <RefreshCw className="text-secondary mb-2" size={20} />
              <h4 className="text-xs font-bold text-text">Reconciliation</h4>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Active</span>
            </div>
            <ArrowRight className="text-[#64748B] rotate-90 md:rotate-0" size={16} />

            {/* Node 2: Root Cause */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-border w-40 text-center shadow-sm shrink-0">
              <Bot className="text-amber-500 mb-2" size={20} />
              <h4 className="text-xs font-bold text-text">Root Cause</h4>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Active</span>
            </div>
            <ArrowRight className="text-[#64748B] rotate-90 md:rotate-0" size={16} />

            {/* Node 3: Supplier */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-border w-40 text-center shadow-sm shrink-0">
              <Layers className="text-[#10B981] mb-2" size={20} />
              <h4 className="text-xs font-bold text-text">Supplier Intel</h4>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Active</span>
            </div>
            <ArrowRight className="text-[#64748B] rotate-90 md:rotate-0" size={16} />

            {/* Node 4: Infrastructure */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-border w-40 text-center shadow-sm shrink-0">
              <Cpu className="text-purple-500 mb-2" size={20} />
              <h4 className="text-xs font-bold text-text">Infrastructure</h4>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Active</span>
            </div>
            <ArrowRight className="text-[#64748B] rotate-90 md:rotate-0" size={16} />

            {/* Node 5: Forecast */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-border w-40 text-center shadow-sm shrink-0">
              <Bot className="text-teal-600 mb-2" size={20} />
              <h4 className="text-xs font-bold text-text">Forecasts</h4>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Active</span>
            </div>
            <ArrowRight className="text-[#64748B] rotate-90 md:rotate-0" size={16} />

            {/* Node 6: Audit */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-border w-40 text-center shadow-sm shrink-0">
              <ShieldCheck className="text-emerald-600 mb-2" size={20} />
              <h4 className="text-xs font-bold text-text">Audits</h4>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Active</span>
            </div>
          </div>
        </div>

        {/* Dynamic Execution logs timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-heading font-bold text-text uppercase tracking-wider">Agent Execution Reasoning & tool ledger</h3>
          <div className="grid grid-cols-1 gap-4">
            {history.map((log) => (
              <div key={log.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 border border-border rounded-lg text-[#0F172A]">
                      <Bot size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text">{log.agent_name}</h4>
                      <span className="text-[10px] text-muted block mt-0.5">Run ID: {log.run_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Confidence: {Math.round(log.confidence * 100)}%
                    </span>
                    <span className="text-[10px] text-muted">{log.timestamp.split("T")[1]?.slice(0, 5) || "09:40"}</span>
                  </div>
                </div>

                <p className="text-xs text-text mt-4 leading-relaxed font-medium">
                  {log.reasoning}
                </p>

                {/* Tool details */}
                {log.tool_calls && (
                  <div className="mt-4 p-3 bg-[#F8FAFC] border border-border rounded-xl flex items-center gap-2 text-[11px] font-semibold text-[#64748B]">
                    <Code size={14} className="text-secondary" />
                    <span>Tool Called: </span>
                    <code className="text-secondary bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{log.tool_calls[0]?.name}</code>
                    <span>→ Response: {log.tool_calls[0]?.result}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

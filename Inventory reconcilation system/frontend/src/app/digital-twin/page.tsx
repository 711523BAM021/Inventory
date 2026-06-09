"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Search, Filter, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Box } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SKUItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit_cost: number;
  retail_price: number;
  erp_quantity: number;
  wms_quantity: number;
  physical_quantity: number;
  safety_stock: number;
  reorder_point: number;
  warehouse: string;
}

const fallbackSKUs: SKUItem[] = [
  { id: 1, sku: "COLD-100421", name: "Thermal Medical Serum Pack B", description: "V-9 Temperature controller vial pack", category: "Medical Cold Chain", unit_cost: 120.0, retail_price: 185.0, erp_quantity: 450, wms_quantity: 450, physical_quantity: 450, safety_stock: 50, reorder_point: 100, warehouse: "Chicago Distribution Hub 1" },
  { id: 2, sku: "ELEC-100234", name: "Precision Microcontroller Module v3", description: "Ultra logic micro module", category: "Electronics", unit_cost: 45.0, retail_price: 80.0, erp_quantity: 1200, wms_quantity: 1200, physical_quantity: 1200, safety_stock: 150, reorder_point: 300, warehouse: "Houston Distribution Hub 2" },
  { id: 3, sku: "AUTO-100871", name: "Heavy-Duty Hydraulic Pump", description: "Steel alloy hydraulic pressure driver", category: "Automotive Parts", unit_cost: 320.0, retail_price: 490.0, erp_quantity: 180, wms_quantity: 170, physical_quantity: 170, safety_stock: 20, reorder_point: 40, warehouse: "Denver Distribution Hub 7" },
  { id: 4, sku: "CHEM-100551", name: "Vapor-Tight Chemical Reagent Box", description: "Acid-neutral reagent packing case", category: "Chemical Reagents", unit_cost: 95.0, retail_price: 150.0, erp_quantity: 600, wms_quantity: 600, physical_quantity: 580, safety_stock: 40, reorder_point: 85, warehouse: "Atlanta Distribution Hub 4" },
  { id: 5, sku: "ELEC-100902", name: "Thermal Sensor Probe Interface", description: "Platinum core wire thermoprobe", category: "Electronics", unit_cost: 15.0, retail_price: 28.0, erp_quantity: 2400, wms_quantity: 2400, physical_quantity: 2400, safety_stock: 200, reorder_point: 400, warehouse: "Los Angeles Distribution Hub 3" }
];

export default function DigitalTwin() {
  const [items, setItems] = useState<SKUItem[]>(fallbackSKUs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10"
        });
        if (search) queryParams.append("search", search);
        if (category !== "All") queryParams.append("category", category);

        const res = await fetch(`http://localhost:8000/api/v1/inventory/items?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
        }
      } catch (err) {
        console.warn("Using offline fallback items");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [search, category, page]);

  const stockChartData = items.map(item => ({
    sku: item.sku,
    Physical: item.physical_quantity,
    ERP: item.erp_quantity,
    WMS: item.wms_quantity
  }));

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Intro */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text">SKU Explorer & Digital Twin</h2>
            <p className="text-sm text-muted">Real-time status synchronization across all warehouses.</p>
          </div>
        </div>

        {/* Charts block representing item quantity bounds */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-heading font-bold text-text mb-6 uppercase tracking-wider">Stock Levels Alignment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData}>
                <XAxis dataKey="sku" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Physical" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ERP" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="WMS" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search & Filter widgets */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
            <input
              type="text"
              placeholder="Search by SKU or Product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-border text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#F8FAFC] border border-border text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Medical Cold Chain">Medical Cold Chain</option>
              <option value="Automotive Parts">Automotive Parts</option>
              <option value="Chemical Reagents">Chemical Reagents</option>
            </select>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-border text-muted font-bold">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Warehouse Location</th>
                  <th className="p-4 text-right">ERP Count</th>
                  <th className="p-4 text-right">WMS Count</th>
                  <th className="p-4 text-right">Physical Count</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const hasDiscrepancy = item.erp_quantity !== item.physical_quantity || item.wms_quantity !== item.physical_quantity;
                  return (
                    <tr key={item.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-secondary">{item.sku}</td>
                      <td className="p-4 font-semibold text-text">{item.name}</td>
                      <td className="p-4 text-muted">{item.warehouse}</td>
                      <td className="p-4 text-right font-medium">{item.erp_quantity}</td>
                      <td className="p-4 text-right font-medium">{item.wms_quantity}</td>
                      <td className="p-4 text-right font-bold text-[#0F172A]">{item.physical_quantity}</td>
                      <td className="p-4">
                        {hasDiscrepancy ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">
                            <AlertCircle size={12} />
                            Mismatch
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] font-bold">
                            <CheckCircle2 size={12} />
                            Matched
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border flex justify-between items-center text-xs text-muted font-semibold bg-[#F8FAFC]">
            <span>Showing {items.length} of {total} SKUs</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={items.length < 10}
                className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

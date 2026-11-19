"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatRupiah, getShortMonthName } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function KasChart() {
  const { transaksiList, settings } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute monthly totals for the active year (2026)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const year = settings.tahun_aktif;

    const pemasukan = transaksiList
      .filter((t) => {
        const d = new Date(t.tanggal);
        return t.tipe === "pemasukan" && d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.nominal, 0);

    const pengeluaran = transaksiList
      .filter((t) => {
        const d = new Date(t.tanggal);
        return t.tipe === "pengeluaran" && d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.nominal, 0);

    return {
      name: getShortMonthName(i),
      bulanFull: i + 1,
      Pemasukan: pemasukan,
      Pengeluaran: pengeluaran,
      Surplus: pemasukan - pengeluaran,
    };
  });

  // Calculate category distribution for expenses
  const expenseCategories: { [key: string]: number } = {};
  transaksiList
    .filter((t) => t.tipe === "pengeluaran")
    .forEach((t) => {
      expenseCategories[t.kategori] = (expenseCategories[t.kategori] || 0) + t.nominal;
    });

  const pieData = Object.keys(expenseCategories).map((cat) => ({
    name: cat,
    value: expenseCategories[cat],
  }));

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899"];

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80 animate-pulse">
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Bar Chart */}
      <Card className="lg:col-span-2 shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                Arus Kas Bulanan (Pemasukan vs Pengeluaran)
              </CardTitle>
              <CardDescription>
                Tinjauan administrasi keuangan kas warga tahun anggaran {settings.tahun_aktif}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#94a3b8", opacity: 0.2 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
                    return String(val);
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value) || 0), ""]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  iconType="circle"
                />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expense Allocation Pie Chart */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold">Alokasi Pengeluaran Kas</CardTitle>
          <CardDescription>Distribusi pos pengeluaran kas lingkungan perumahan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val) || 0), ""]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Belum ada data pengeluaran</p>
            )}
          </div>
          <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-semibold">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

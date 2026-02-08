"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-600 mt-2">Business insights and performance metrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales & Performance Analytics
          </CardTitle>
          <CardDescription>Charts showing monthly sales vs purchases and stock distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Analytics Dashboard - Coming Soon</p>
            <p className="text-sm">
              This page will display bar charts for monthly sales vs purchases, pie charts for stock distribution, and KPI cards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

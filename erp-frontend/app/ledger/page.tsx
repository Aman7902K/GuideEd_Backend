"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function LedgerPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Ledger & Accounting</h1>
        <p className="text-slate-600 mt-2">Track all transactions and financial records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Transaction Ledger
          </CardTitle>
          <CardDescription>View transaction history and export to CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Ledger & Accounting - Coming Soon</p>
            <p className="text-sm">
              This page will show all transactions, running balance, and include CSV export functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

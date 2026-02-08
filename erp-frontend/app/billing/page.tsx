"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Billing POS</h1>
        <p className="text-slate-600 mt-2">Create invoices and process payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Point of Sale System
          </CardTitle>
          <CardDescription>Cart system with UPI QR code generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Billing POS - Coming Soon</p>
            <p className="text-sm">
              This page will feature a cart system, discount calculations, and real-time UPI QR code generation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

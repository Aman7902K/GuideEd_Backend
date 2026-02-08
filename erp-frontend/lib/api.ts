const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = {
  // Products
  products: {
    getAll: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE_URL}/products?${query}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    getLowStock: async (threshold?: number) => {
      const query = threshold ? `?threshold=${threshold}` : "";
      const res = await fetch(`${API_BASE_URL}/products/low-stock${query}`);
      if (!res.ok) throw new Error("Failed to fetch low stock products");
      return res.json();
    },
    getCategories: async () => {
      const res = await fetch(`${API_BASE_URL}/products/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    updateStock: async (id: string, quantity: number, operation: "add" | "subtract" | "set") => {
      const res = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, operation }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      return res.json();
    },
  },

  // Transactions
  transactions: {
    getAll: async (params?: { type?: string; page?: number; limit?: number; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE_URL}/transactions?${query}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch transaction");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create transaction");
      }
      return res.json();
    },
    getSalesAnalytics: async (startDate?: string, endDate?: string) => {
      const query = new URLSearchParams({ startDate, endDate } as any).toString();
      const res = await fetch(`${API_BASE_URL}/transactions/analytics/sales?${query}`);
      if (!res.ok) throw new Error("Failed to fetch sales analytics");
      return res.json();
    },
    getMonthlyAnalytics: async (year?: number) => {
      const query = year ? `?year=${year}` : "";
      const res = await fetch(`${API_BASE_URL}/transactions/analytics/monthly${query}`);
      if (!res.ok) throw new Error("Failed to fetch monthly analytics");
      return res.json();
    },
  },

  // Ledger
  ledger: {
    getAll: async (params?: { page?: number; limit?: number; entityType?: string; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE_URL}/ledger?${query}`);
      if (!res.ok) throw new Error("Failed to fetch ledger entries");
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/ledger/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ledger entry");
      return res.json();
    },
    getBalance: async () => {
      const res = await fetch(`${API_BASE_URL}/ledger/balance`);
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
    getSummary: async (startDate?: string, endDate?: string) => {
      const query = new URLSearchParams({ startDate, endDate } as any).toString();
      const res = await fetch(`${API_BASE_URL}/ledger/summary?${query}`);
      if (!res.ok) throw new Error("Failed to fetch ledger summary");
      return res.json();
    },
    exportCSV: async (startDate?: string, endDate?: string) => {
      const query = new URLSearchParams({ startDate, endDate } as any).toString();
      const res = await fetch(`${API_BASE_URL}/ledger/export?${query}`);
      if (!res.ok) throw new Error("Failed to export ledger");
      return res.blob();
    },
  },
};

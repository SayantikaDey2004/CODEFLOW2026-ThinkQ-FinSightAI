export type TransactionType = "credit" | "debit";

export interface TransactionRecord {
  id: number;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: TransactionType;
  note: string;
  unusual: boolean;
}

export interface UploadSnapshot {
  uploadedAt: string;
  files: Array<{ name: string; size: number; type: string }>;
  transactions: TransactionRecord[];
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  unusualCount: number;
  savingsRate: number;
  topCategory: string;
  categoryTotals: Record<string, number>;
}

const STORAGE_KEY = "finsight_upload_snapshot";

function safeWindowStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return {
    local: window.localStorage,
    session: window.sessionStorage,
  };
}

export function buildTransactionSummary(transactions: TransactionRecord[]): TransactionSummary {
  const totalIncome = transactions.filter((item) => item.type === "credit").reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = transactions.filter((item) => item.type === "debit").reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const unusualCount = transactions.filter((item) => item.unusual).length;
  const categoryTotals = transactions.reduce<Record<string, number>>((accumulator, item) => {
    if (item.type === "debit") {
      accumulator[item.category] = (accumulator[item.category] || 0) + Math.abs(item.amount);
    }
    return accumulator;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "N/A";

  return {
    totalIncome,
    totalExpense,
    netSavings,
    transactionCount: transactions.length,
    unusualCount,
    savingsRate,
    topCategory,
    categoryTotals,
  };
}

export function saveUploadSnapshot(files: Array<{ name: string; size: number; type: string }>, transactions: TransactionRecord[]) {
  const storage = safeWindowStorage();
  if (!storage) {
    return;
  }

  const snapshot: UploadSnapshot = {
    uploadedAt: new Date().toISOString(),
    files,
    transactions,
  };

  const raw = JSON.stringify(snapshot);
  storage.local.setItem(STORAGE_KEY, raw);
  storage.session.setItem(STORAGE_KEY, raw);
}

export function loadUploadSnapshot(): UploadSnapshot | null {
  const storage = safeWindowStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.local.getItem(STORAGE_KEY) || storage.session.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UploadSnapshot;
  } catch {
    return null;
  }
}

export function clearUploadSnapshot() {
  const storage = safeWindowStorage();
  if (!storage) {
    return;
  }

  storage.local.removeItem(STORAGE_KEY);
  storage.session.removeItem(STORAGE_KEY);
}

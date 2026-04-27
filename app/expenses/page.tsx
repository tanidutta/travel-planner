"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTrips } from "@/utils/storage";

const CATEGORIES = ["All", "Food", "Hotel", "Travel", "Shopping", "Other"];
const CURRENCY = "₹";

interface FlatExpense {
  name: string;
  amount: number;
  category: string;
  tripName: string;
  tripId: string;
}

export default function ExpensesPage() {
  const [allExpenses, setAllExpenses] = useState<FlatExpense[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const trips = getTrips();
    const flat: FlatExpense[] = trips.flatMap(trip =>
      (trip.budget?.expenses || []).map(expense => ({
        name: expense.name,
        amount: expense.amount,
        category: expense.category || "Other",
        tripName: trip.name,
        tripId: trip.id,
      }))
    );
    setAllExpenses(flat);
  }, []);

  const filtered = filter === "All"
    ? allExpenses
    : allExpenses.filter(e => e.category === filter);

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="page-background min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="text-sm mb-6 inline-block"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to trips
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            All Expenses
          </h1>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {filtered.length} expense{filtered.length !== 1 ? "s" : ""} · {CURRENCY}{totalFiltered.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{
                background: filter === cat ? "var(--color-primary)" : "var(--color-surface)",
                color: filter === cat ? "#ffffff" : "var(--color-text-secondary)",
                borderColor: filter === cat ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No expenses found for this category.
            </p>
          </div>
        ) : (
          <div className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
            {filtered.map((expense, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {expense.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--color-background)",
                        color: "var(--color-text-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {expense.category}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {expense.tripName}
                  </span>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {CURRENCY}{expense.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

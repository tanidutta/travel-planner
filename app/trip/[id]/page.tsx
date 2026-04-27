"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import CountUp from "react-countup";
import { Trip } from "@/lib/types";
import { getTrips, saveTrips, getTripById } from "@/utils/storage";
import ConfirmModal from "@/components/ConfirmModal";
import CreateTripModal from "@/components/CreateTripModal";

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [showItinerary, setShowItinerary] = useState(false);
  const [activeDays, setActiveDays] = useState(1);
  const [activeInputDay, setActiveInputDay] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(null);
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [editExpenseCategory, setEditExpenseCategory] = useState("Food");

  const CURRENCY = "₹";
  const CATEGORIES = ["Food", "Hotel", "Travel", "Shopping", "Other"];

  useEffect(() => {
    const found = getTripById(id as string);

    if (found) {
      setTrip(found);
      if (found.itinerary && Object.keys(found.itinerary).length > 0) {
        setShowItinerary(true);
        setActiveDays(Object.keys(found.itinerary).length);
      }
    } else {
      setNotFound(true);
    }
  }, []);

  const updateExpense = (index: number) => {
    const amount = parseFloat(editExpenseAmount);
    if (!editExpenseName.trim() || isNaN(amount) || amount <= 0) return;

    const trips = getTrips();
    const tripIndex = trips.findIndex((t) => t.id === id);
    if (tripIndex === -1) return;

    const updatedExpenses = [...(trips[tripIndex].budget?.expenses || [])];
    updatedExpenses[index] = { name: editExpenseName.trim(), amount, category: editExpenseCategory };

    trips[tripIndex] = {
      ...trips[tripIndex],
      budget: {
        total: trips[tripIndex].budget?.total || 0,
        expenses: updatedExpenses,
      },
    };

    saveTrips(trips);
    setTrip(trips[tripIndex]);
    setEditingExpenseIndex(null);
    setEditExpenseName("");
    setEditExpenseAmount("");
    toast.success("Expense updated");
  };

  const deleteExpense = (index: number) => {
    const trips = getTrips();
    const tripIndex = trips.findIndex((t) => t.id === id);
    if (tripIndex === -1) return;

    const updatedExpenses = (trips[tripIndex].budget?.expenses || []).filter(
      (_, i) => i !== index
    );

    trips[tripIndex] = {
      ...trips[tripIndex],
      budget: {
        total: trips[tripIndex].budget?.total || 0,
        expenses: updatedExpenses,
      },
    };

    saveTrips(trips);
    setTrip(trips[tripIndex]);
    toast.success("Expense removed");
  };

  const saveBudgetTotal = () => {
    const total = parseFloat(budgetInput);
    if (isNaN(total) || total <= 0) return;

    const trips = getTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) return;

    trips[index] = {
      ...trips[index],
      budget: {
        total,
        expenses: trips[index].budget?.expenses || [],
      },
    };
    saveTrips(trips);
    setTrip(trips[index]);
    setIsEditingBudget(false);
    toast.success("Budget set");
  };

  const addExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseName.trim() || isNaN(amount) || amount <= 0) return;

    const trips = getTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) return;

    const existingExpenses = trips[index].budget?.expenses || [];
    const existingTotal = trips[index].budget?.total || 0;

    trips[index] = {
      ...trips[index],
      budget: {
        total: existingTotal,
        expenses: [...existingExpenses, { name: expenseName.trim(), amount, category: expenseCategory }],
      },
    };
    saveTrips(trips);
    setTrip(trips[index]);

    const newSpent = [...existingExpenses, { name: expenseName.trim(), amount }]
      .reduce((sum, e) => sum + e.amount, 0);

    if (newSpent > existingTotal) {
      toast.error(`You are ₹${(newSpent - existingTotal).toLocaleString("en-IN")} over budget!`);
    } else {
      toast.success("Expense added");
    }

    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("Food");
  };

  const refreshTrip = () => {
    const found = getTripById(id as string);
    if (found) setTrip(found);
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    const trips = getTrips();
    const updated = trips.filter((t) => t.id !== id);
    saveTrips(updated);
    toast.success("Trip deleted");
    router.push("/");
  };

  const removeDay = (dayIndex: number) => {
    const trips = getTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) return;

    const existingItinerary = trips[index].itinerary || {};

    const newItinerary: { [key: string]: string[] } = {};
    let newIndex = 1;
    for (let i = 1; i <= activeDays; i++) {
      if (i === dayIndex) continue;
      newItinerary[`day${newIndex}`] = existingItinerary[`day${i}`] || [];
      newIndex++;
    }

    const updatedTrip = { ...trips[index], itinerary: newItinerary };
    trips[index] = updatedTrip;
    saveTrips(trips);
    setTrip(updatedTrip);
    setActiveDays((prev) => prev - 1);
    setActiveInputDay(null);
    if (activeDays === 1) {
      setShowItinerary(false);
      setIsEditing(false);
    }
  };

  const addActivity = (dayKey: string) => {
    const activity = inputs[dayKey]?.trim();
    if (!activity) return;

    const trips = getTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) return;

    const existingItinerary = trips[index].itinerary || {};
    const existingDay = existingItinerary[dayKey] || [];

    const updatedTrip = {
      ...trips[index],
      itinerary: {
        ...existingItinerary,
        [dayKey]: [...existingDay, activity],
      },
    };

    trips[index] = updatedTrip;
    saveTrips(trips);

    setTrip(updatedTrip);
    setInputs((prev) => ({ ...prev, [dayKey]: "" }));
    setActiveInputDay(null);
  };

  if (notFound) {
    return (
      <div className="page-background flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Trip not found.</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="page-background flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-background min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to trips
        </Link>

        <div className="card p-8">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            {trip.name}
          </h1>
          <p
            className="text-base mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {trip.destination}
          </p>

          <hr className="border-gray-100 mb-6" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Start Date
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {trip.startDate}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Duration
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {trip.days} {trip.days === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-primary px-4 py-2 text-sm"
          >
            Edit Trip
          </button>
          <button
            onClick={handleDelete}
            className="text-sm px-4 py-2 rounded-lg border transition-colors hover:bg-red-50"
            style={{ color: "#dc2626", borderColor: "#fecaca" }}
          >
            Delete Trip
          </button>
        </div>

        {/* Block A — No itinerary yet */}
        {(!showItinerary || (!isEditing && (() => {
          const hasAnyActivity = Array.from(
            { length: activeDays },
            (_, i) => trip.itinerary?.[`day${i + 1}`] || []
          ).some(activities => activities.length > 0)
          return !hasAnyActivity
})())) && (
          <div className="mt-8">
            <button
              onClick={() => {
                setShowItinerary(true);
                setIsEditing(true);
                setActiveDays(1);
              }}
              className="btn-primary px-6 py-2 text-sm"
            >
              + Add Itinerary
            </button>
          </div>
        )}

        {/* Block B — View mode */}
        {showItinerary && !isEditing && (() => {
          const hasAnyActivity = Array.from(
            { length: activeDays },
            (_, i) => trip.itinerary?.[`day${i + 1}`] || []
          ).some(activities => activities.length > 0)
          return hasAnyActivity
        })() && (
          <div className="mt-10">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Itinerary
            </h2>

            <div className="card p-6">
              {Array.from({ length: activeDays }, (_, i) => {
                const dayKey = `day${i + 1}`;
                const activities = trip.itinerary?.[dayKey] || [];

                return (
                  <div key={dayKey} className={i > 0 ? "mt-6" : ""}>
                    {i > 0 && (
                      <div
                        className="border-t mb-4"
                        style={{ borderColor: "var(--color-border)" }}
                      />
                    )}
                    <h3
                      className="text-xs font-semibold uppercase tracking-wide mb-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Day {i + 1}
                    </h3>

                    {activities.length > 0 ? (
                      <ul className="space-y-1">
                        {activities.map((activity, idx) => (
                          <li
                            key={idx}
                            className="text-sm flex items-start gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            <span style={{ color: "var(--color-text-muted)" }}>•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        No activities added.
                      </p>
                    )}
                  </div>
                );
              })}

              <div
                className="mt-6 pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setActiveInputDay(null);
                  }}
                  className="btn-primary px-6 py-2 text-sm"
                >
                  Edit Itinerary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block C — Edit mode */}
        {showItinerary && isEditing && (
          <div className="mt-10">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Itinerary
            </h2>

            {Array.from({ length: activeDays }, (_, i) => {
              const dayKey = `day${i + 1}`;
              const activities = trip.itinerary?.[dayKey] || [];
              const isInputOpen = activeInputDay === dayKey;

              return (
                <div key={dayKey} className="card p-6 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Day {i + 1}
                    </h3>
                    <button
                      onClick={() => removeDay(i + 1)}
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Remove
                    </button>
                  </div>

                  {activities.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {activities.map((activity, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-2"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          <span style={{ color: "var(--color-text-muted)" }}>•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isInputOpen ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Type activity..."
                        value={inputs[dayKey] || ""}
                        onChange={(e) =>
                          setInputs((prev) => ({ ...prev, [dayKey]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addActivity(dayKey);
                          }
                        }}
                        autoFocus
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: "var(--color-border)" }}
                      />
                      <button
                        onClick={() => addActivity(dayKey)}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveInputDay(dayKey)}
                      className="text-sm font-medium mt-1"
                      style={{ color: "var(--color-primary)" }}
                    >
                      + Add activity
                    </button>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between mt-2">
              {activeDays < trip.days ? (
                <button
                  onClick={() => {
                    setActiveDays((prev) => prev + 1);
                    setActiveInputDay(null);
                  }}
                  className="text-sm font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  + Add Day
                </button>
              ) : (
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  All {trip.days} days added.
                </p>
              )}

              <button
                onClick={() => {
                  setIsEditing(false);
                  setActiveInputDay(null);
                }}
                className="btn-primary px-6 py-2 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
        <div className="mt-10">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Budget
          </h2>

          {/* Part A — Set total budget */}
          {(!trip.budget?.total || isEditingBudget) && (
            <div className="card p-6 mb-4">
              <p
                className="text-sm font-medium mb-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Set your total budget
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Enter total budget"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveBudgetTotal();
                    }}
                    className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: "var(--color-border)" }}
                  />
                </div>
                <button
                  onClick={saveBudgetTotal}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Set Budget
                </button>
                {isEditingBudget && (
                  <button
                    onClick={() => setIsEditingBudget(false)}
                    className="px-4 py-2 text-sm rounded-lg border"
                    style={{
                      color: "var(--color-text-secondary)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Part B — Summary cards */}
          {trip.budget?.total && !isEditingBudget && (() => {
            const total = trip.budget!.total;
            const spent = trip.budget!.expenses.reduce((sum, e) => sum + e.amount, 0);
            const remaining = total - spent;
            const isOver = remaining < 0;

            return (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card p-4 text-center">
                  <p
                    className="text-xs font-medium uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Total Budget
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {CURRENCY}<CountUp end={total} duration={1} separator="," />
                  </p>
                  <button
                    onClick={() => {
                      setBudgetInput(String(total));
                      setIsEditingBudget(true);
                    }}
                    className="text-xs mt-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Edit
                  </button>
                </div>

                <div className="card p-4 text-center">
                  <p
                    className="text-xs font-medium uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Spent
                  </p>
                  <p className="text-lg font-semibold" style={{ color: "#dc2626" }}>
                    {CURRENCY}<CountUp end={spent} duration={1} separator="," />
                  </p>
                </div>

                <div className="card p-4 text-center">
                  <p
                    className="text-xs font-medium uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Remaining
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: isOver ? "#dc2626" : "#16a34a" }}
                  >
                    {isOver ? "-" : ""}{CURRENCY}
                    <CountUp end={Math.abs(remaining)} duration={1} separator="," />
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Part C — Expense list */}
          {(trip.budget?.expenses?.length ?? 0) > 0 && (
            <div className="card p-6 mb-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Expenses
              </h3>
              <ul className="space-y-2">
                {trip.budget!.expenses.map((expense, idx) =>
                  editingExpenseIndex === idx ? (
                    <li key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editExpenseName}
                        onChange={(e) => setEditExpenseName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateExpense(idx);
                          if (e.key === "Escape") setEditingExpenseIndex(null);
                        }}
                        autoFocus
                        className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: "var(--color-border)" }}
                      />
                      <select
                        value={editExpenseCategory}
                        onChange={(e) => setEditExpenseCategory(e.target.value)}
                        className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="relative w-28">
                        <span
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          ₹
                        </span>
                        <input
                          type="number"
                          value={editExpenseAmount}
                          onChange={(e) => setEditExpenseAmount(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateExpense(idx);
                            if (e.key === "Escape") setEditingExpenseIndex(null);
                          }}
                          className="w-full border rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ borderColor: "var(--color-border)" }}
                        />
                      </div>
                      <button
                        onClick={() => updateExpense(idx)}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingExpenseIndex(null)}
                        className="px-3 py-1.5 text-xs rounded-lg border"
                        style={{
                          color: "var(--color-text-secondary)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        Cancel
                      </button>
                    </li>
                  ) : (
                    <li key={idx} className="flex items-center justify-between group">
                      <span
                        className="text-sm flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        <span style={{ color: "var(--color-text-muted)" }}>•</span>
                        {expense.name}
                        <span
                          className="text-xs px-2 py-0.5 rounded-full ml-2"
                          style={{
                            background: "var(--color-background)",
                            color: "var(--color-text-muted)",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          {expense.category || "Other"}
                        </span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {CURRENCY}{expense.amount.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => {
                            setEditingExpenseIndex(idx);
                            setEditExpenseName(expense.name);
                            setEditExpenseAmount(String(expense.amount));
                            setEditExpenseCategory(expense.category || "Other");
                          }}
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--color-primary)" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExpense(idx)}
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "#dc2626" }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Part D — Add expense form */}
          {trip.budget?.total && !isEditingBudget && (
            <div className="card p-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Add Expense
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Expense name"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: "var(--color-border)" }}
                />
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="relative w-32">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addExpense();
                    }}
                    className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: "var(--color-border)" }}
                  />
                </div>
                <button
                  onClick={addExpense}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this trip?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {isEditModalOpen && trip && (
        <CreateTripModal
          mode="edit"
          existingTrip={trip}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            refreshTrip();
            toast.success("Trip updated");
          }}
        />
      )}
    </div>
  );
}

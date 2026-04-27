"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import CreateTripModal from "@/components/CreateTripModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useTrips } from "@/hooks/useTrips";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const { trips, handleDelete, refreshTrips } = useTrips();

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    handleDelete(confirmDeleteId);
    setConfirmDeleteId(null);
    toast.success("Trip deleted");
  };

  const today = new Date();
  const filteredTrips = trips.filter(t => {
    if (filter === "upcoming") return new Date(t.startDate) > today;
    if (filter === "past") return new Date(t.startDate) <= today;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar onCreateClick={() => setIsModalOpen(true)} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {trips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div
              onClick={() => setFilter("all")}
              className="card p-5 flex flex-col justify-between cursor-pointer transition-all"
              style={{
                borderColor: filter === "all" ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: filter === "all" ? "2px" : "1px",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-2 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Total Trips</p>
              <p className="text-3xl font-bold text-center"
                 style={{ color: filter === "all" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                {trips.length}
              </p>
              <div className="mt-3" />
            </div>
            <div
              onClick={() => setFilter("upcoming")}
              className="card p-5 flex flex-col justify-between cursor-pointer transition-all"
              style={{
                borderColor: filter === "upcoming" ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: filter === "upcoming" ? "2px" : "1px",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-2 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Upcoming</p>
              <p className="text-3xl font-bold text-center"
                 style={{ color: filter === "upcoming" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                {trips.filter(t => new Date(t.startDate) > today).length}
              </p>
              <div className="mt-3" />
            </div>
            <div
              onClick={() => setFilter("past")}
              className="card p-5 flex flex-col justify-between cursor-pointer transition-all"
              style={{
                borderColor: filter === "past" ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: filter === "past" ? "2px" : "1px",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-2 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Past Trips</p>
              <p className="text-3xl font-bold text-center"
                 style={{ color: filter === "past" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                {trips.filter(t => new Date(t.startDate) <= today).length}
              </p>
              <div className="mt-3" />
            </div>
            <div className="card p-5 flex flex-col justify-between">
              <p className="text-xs font-medium uppercase tracking-wide mb-2 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Total Spent</p>
              <p className="text-3xl font-bold text-center" style={{ color: "#16a34a" }}>
                ₹{trips.reduce((sum, t) => {
                  const expenses = t.budget?.expenses || [];
                  return sum + expenses.reduce((s, e) => s + e.amount, 0);
                }, 0).toLocaleString("en-IN")}
              </p>
              <div className="text-center mt-3">
                <a
                  href="/expenses"
                  className="text-xs font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  View All →
                </a>
              </div>
            </div>
          </div>
        )}
<h1 className="text-2xl font-semibold text-slate-800 mb-6">My Trips</h1>
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No trips yet. Click "Create Trip" to get started.</p>
          </div>
        ) : (
          <>
            {filteredTrips.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No {filter} trips found.
                </p>
                <button
                  onClick={() => setFilter("all")}
                  className="text-sm mt-2 font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  Show all trips
                </button>
              </div>
            )}
            {filteredTrips.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {isModalOpen && (
        <CreateTripModal
          onClose={() => setIsModalOpen(false)}
          onSave={refreshTrips}
        />
      )}
      {confirmDeleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this trip?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import CreateTripModal from "@/components/CreateTripModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useTrips } from "@/hooks/useTrips";
import Banner from "@/components/Banner";

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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Banner />
        {trips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-6">
            <div
              onClick={() => setFilter("all")}
              className="card px-3 py-2 flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{
                borderColor: filter === "all" ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: filter === "all" ? "2px" : "1px",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Total Trips</p>
              <p className="text-2xl font-bold text-center"
                 style={{ color: filter === "all" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                {trips.length}
              </p>
            </div>
            <div
              onClick={() => setFilter("upcoming")}
              className="card px-3 py-2 flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{
                borderColor: filter === "upcoming" ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: filter === "upcoming" ? "2px" : "1px",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Upcoming</p>
              <p className="text-2xl font-bold text-center"
                 style={{ color: filter === "upcoming" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                {trips.filter(t => new Date(t.startDate) > today).length}
              </p>
            </div>
            <div
              onClick={() => setFilter("past")}
              className="card px-3 py-2 flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{
                borderColor: filter === "past" ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: filter === "past" ? "2px" : "1px",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Past Trips</p>
              <p className="text-2xl font-bold text-center"
                 style={{ color: filter === "past" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                {trips.filter(t => new Date(t.startDate) <= today).length}
              </p>
            </div>
            <div className="card px-3 py-2 flex flex-col items-center justify-center">
              <p className="text-xs font-medium uppercase tracking-wide mb-1 text-center"
                 style={{ color: "var(--color-text-muted)" }}>Total Spent</p>
              <p className="text-2xl font-bold text-center" style={{ color: "#16a34a" }}>
                ₹{trips.reduce((sum, t) => {
                  const expenses = t.budget?.expenses || [];
                  return sum + expenses.reduce((s, e) => s + e.amount, 0);
                }, 0).toLocaleString("en-IN")}
              </p>
              <a
                href="/expenses"
                className="text-xs font-medium mt-1"
                style={{ color: "var(--color-primary)" }}
              >
                View All →
              </a>
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

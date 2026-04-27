"use client";

import { useState } from "react";
import { Trip } from "@/lib/types";
import { getTrips, saveTrips, updateTrip } from "@/utils/storage";

interface Props {
  onClose: () => void;
  onSave: () => void;
  mode?: "create" | "edit";
  existingTrip?: Trip;
}

export default function CreateTripModal({ onClose, onSave, mode, existingTrip }: Props) {
  const [form, setForm] = useState({
    name: existingTrip?.name || "",
    destination: existingTrip?.destination || "",
    days: existingTrip?.days || 1,
    startDate: existingTrip?.startDate || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "edit" && existingTrip) {
      updateTrip({
        ...existingTrip,
        name: form.name,
        destination: form.destination,
        days: Number(form.days),
        startDate: form.startDate,
      });
    } else {
      const newTrip: Trip = {
        id: Date.now().toString(),
        name: form.name,
        destination: form.destination,
        days: Number(form.days),
        startDate: form.startDate,
      };
      const existing = getTrips();
      saveTrips([...existing, newTrip]);
    }

    setForm({ name: "", destination: "", days: 1, startDate: "" });
    onSave();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {mode === "edit" ? "Edit Trip" : "Create a New Trip"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Trip Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Number of Days
            </label>
            <input
              type="number"
              name="days"
              value={form.days}
              onChange={handleChange}
              min="1"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            {mode === "edit" ? "Update Trip" : "Save Trip"}
          </button>
        </form>
      </div>
    </div>
  );
}

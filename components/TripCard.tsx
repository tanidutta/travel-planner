import Link from "next/link";
import { Trip } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  return (
    <Link href={`/trip/${trip.id}`} className="block">
      <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (confirm("Are you sure you want to delete this trip?")) {
              onDelete(trip.id);
            }
          }}
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          ✕
        </button>
        <div className="h-1 bg-blue-600" />
        <div className="p-4">
          <h2 className="text-base font-semibold text-slate-800">{trip.destination}</h2>
          <p className="text-sm text-slate-500 mt-1">{trip.name}</p>
          <div className="flex flex-row gap-3 text-xs text-slate-400 mt-3">
            <span>{trip.startDate}</span>
            <span>{trip.days} {trip.days === 1 ? "day" : "days"}</span>
          </div>
          {trip.budget?.total ? (() => {
            const total = trip.budget!.total;
            const spent = trip.budget!.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
            const diff = total - spent;
            return (
              <div
                className="mt-3 pt-3 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    ₹{spent.toLocaleString("en-IN")} of ₹{total.toLocaleString("en-IN")}
                  </span>
                  {diff > 0 && (
                    <span className="text-xs font-medium" style={{ color: "#16a34a" }}>
                      ✔ Saved ₹{diff.toLocaleString("en-IN")}
                    </span>
                  )}
                  {diff === 0 && (
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                      On budget
                    </span>
                  )}
                  {diff < 0 && (
                    <span className="text-xs font-medium" style={{ color: "#dc2626" }}>
                      ⚠ Over ₹{Math.abs(diff).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            );
          })() : null}
        </div>
      </div>
    </Link>
  );
}

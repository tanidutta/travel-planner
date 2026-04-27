"use client";

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-sm font-medium mb-6 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm rounded-lg border transition-colors hover:bg-slate-50"
            style={{
              color: "var(--color-text-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-red-600"
            style={{
              background: "#dc2626",
              color: "#ffffff",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

interface NavbarProps {
  onCreateClick: () => void;
}

export default function Navbar({ onCreateClick }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
      <Link href="/">
        <span className="text-lg font-semibold text-slate-800">Travel Planner</span>
      </Link>
      <button
        onClick={onCreateClick}
        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Trip
      </button>
    </nav>
  );
}

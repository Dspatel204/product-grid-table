import { Trash2, X } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  savingCount: number;
}

export function BulkActions({ selectedCount, onClearSelection, onBulkDelete, savingCount }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="animate-slide-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
          {selectedCount} selected
        </span>
        <div className="h-5 w-px bg-gray-200 dark:bg-slate-700" />
        <button
          onClick={onBulkDelete}
          disabled={savingCount > 0}
          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
          {savingCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              {savingCount}
            </span>
          )}
        </button>
        <button
          onClick={onClearSelection}
          className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

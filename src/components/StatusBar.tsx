interface StatusBarProps {
  total: number;
  showing: { start: number; end: number };
  selectedCount: number;
  loading: boolean;
}

export function StatusBar({ total, showing, selectedCount, loading }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
      <div className="flex items-center gap-4">
        <span>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Loading...
            </span>
          ) : (
            <>
              Showing <span className="font-semibold text-gray-700 dark:text-slate-200">{showing.start}-{showing.end}</span> of{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">{total}</span> products
            </>
          )}
        </span>
        {selectedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            {selectedCount} selected
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <span className="rounded-md bg-gray-50 px-2 py-1 dark:bg-slate-700">
          Total: <span className="font-medium">{total}</span>
        </span>
      </div>
    </div>
  );
}

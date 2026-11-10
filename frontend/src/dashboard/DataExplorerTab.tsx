import React, { useState, useEffect } from 'react';
import {
  Table,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  SlidersHorizontal,
  Info,
  Loader2,
  Check
} from 'lucide-react';
import { DatasetDetail, api } from '../services/api';

interface DataExplorerTabProps {
  datasetDetail: DatasetDetail | null;
}

export const DataExplorerTab: React.FC<DataExplorerTabProps> = ({ datasetDetail }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortAsc, setSortAsc] = useState(true);

  const [previewData, setPreviewData] = useState<{
    columns: string[];
    column_types: Record<string, string>;
    rows: any[];
    total_rows: number;
    total_cols: number;
    total_pages: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showColFilter, setShowColFilter] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load preview records whenever page, pageSize, search, sortBy, sortAsc, or datasetDetail changes
  useEffect(() => {
    if (!datasetDetail) return;
    loadPreview();
  }, [datasetDetail?.id, page, pageSize, debouncedSearch, sortBy, sortAsc]);

  // Sync visible columns when datasetDetail updates
  useEffect(() => {
    if (datasetDetail && datasetDetail.columns) {
      const allCols = datasetDetail.columns.map((c) => c.name);
      setVisibleColumns(allCols);
      if (!selectedCol && allCols.length > 0) {
        setSelectedCol(allCols[0]);
      }
    }
  }, [datasetDetail?.id]);

  const loadPreview = async () => {
    if (!datasetDetail) return;
    setLoading(true);
    try {
      const res = await api.getPreview(datasetDetail.id, {
        page,
        pageSize,
        search: debouncedSearch,
        sortBy,
        sortAsc,
      });
      setPreviewData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderClick = (col: string) => {
    if (sortBy === col) {
      if (sortAsc) {
        setSortAsc(false);
      } else {
        setSortBy(undefined);
        setSortAsc(true);
      }
    } else {
      setSortBy(col);
      setSortAsc(true);
    }
  };

  const toggleColumnVisibility = (col: string) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((c) => c !== col));
      }
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  const colMeta = datasetDetail?.columns?.find((c) => c.name === selectedCol);

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-400" />
            Interactive Data Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real records from <span className="text-slate-200 font-medium">{datasetDetail?.name}</span> ({datasetDetail?.total_rows.toLocaleString()} rows × {datasetDetail?.total_cols} columns)
          </p>
        </div>

        {/* Global Search and Page Size Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all records..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-white/10">
            <span>Rows:</span>
            {[10, 25, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  pageSize === size
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Column selector toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColFilter(!showColFilter)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Columns ({visibleColumns.length})</span>
            </button>

            {showColFilter && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1 mb-1">
                  Toggle Columns Visibility
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {datasetDetail?.columns.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => toggleColumnVisibility(c.name)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="truncate">{c.name}</span>
                      {visibleColumns.includes(c.name) && (
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Column Insight Bar */}
      {colMeta && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Inspecting:</span>
            <span className="font-semibold text-white font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-blue-300">
              {colMeta.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
              {colMeta.dtype}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>
              Uniques: <strong className="text-slate-200">{colMeta.unique_count.toLocaleString()}</strong>
            </span>
            <span>
              Missing: <strong className={colMeta.missing_count > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {colMeta.missing_count.toLocaleString()} ({colMeta.missing_percentage}%)
              </strong>
            </span>
            {colMeta.is_numerical && (
              <>
                <span>Mean: <strong className="text-blue-300">{colMeta.mean_val}</strong></span>
                <span>Median: <strong className="text-emerald-300">{colMeta.median_val}</strong></span>
                <span>Std: <strong className="text-purple-300">{colMeta.std_val}</strong></span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl bg-[#111827] border border-white/10 overflow-hidden shadow-2xl relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-20">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#0E1522] sticky top-0 z-10 border-b border-white/10 select-none">
              <tr>
                <th className="px-4 py-3 text-[10px] font-mono uppercase text-slate-500 w-12 text-center">#</th>
                {previewData?.columns
                  .filter((col) => visibleColumns.includes(col))
                  .map((col) => {
                    const isSorted = sortBy === col;
                    return (
                      <th
                        key={col}
                        onClick={() => {
                          handleHeaderClick(col);
                          setSelectedCol(col);
                        }}
                        className={`px-4 py-3 font-mono text-[11px] cursor-pointer hover:bg-white/5 transition-colors ${
                          selectedCol === col ? 'text-blue-400' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          {isSorted ? (
                            sortAsc ? (
                              <ArrowUp className="w-3 h-3 text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 hover:text-slate-400" />
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 block font-normal">
                          {previewData.column_types[col]}
                        </span>
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
              {previewData?.rows && previewData.rows.length > 0 ? (
                previewData.rows.map((row, idx) => {
                  const rowNum = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2 text-slate-500 text-center text-[10px]">{rowNum}</td>
                      {previewData.columns
                        .filter((col) => visibleColumns.includes(col))
                        .map((col) => {
                          const val = row[col];
                          const isNull = val === null || val === undefined || val === '?' || val === '';
                          return (
                            <td
                              key={col}
                              onClick={() => setSelectedCol(col)}
                              className={`px-4 py-2 cursor-pointer ${
                                selectedCol === col ? 'bg-blue-600/5' : ''
                              }`}
                            >
                              {isNull ? (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono">
                                  null
                                </span>
                              ) : typeof val === 'number' ? (
                                <span className="text-emerald-300">{val.toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-200">{String(val)}</span>
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="p-8 text-center text-slate-500 text-xs">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs bg-[#0E1522]">
          <div className="text-slate-400 font-mono text-[11px]">
            Showing records {((page - 1) * pageSize + 1).toLocaleString()} to{' '}
            {Math.min(page * pageSize, previewData?.total_rows || 0).toLocaleString()} of{' '}
            {previewData?.total_rows.toLocaleString()}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-slate-400">
              Page <strong className="text-white">{page}</strong> of{' '}
              {previewData?.total_pages || 1}
            </span>
            <button
              disabled={page >= (previewData?.total_pages || 1)}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

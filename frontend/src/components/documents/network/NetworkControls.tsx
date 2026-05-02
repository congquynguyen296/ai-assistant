import { LayoutGrid, Scan, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onAutoLayout: () => void;
};

export default function NetworkControls({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFit,
  onAutoLayout,
}: Props) {
  return (
    <div
      data-network-ui
      className="absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur px-2 py-2 shadow-md shadow-slate-900/10"
    >
      <button
        type="button"
        onClick={onZoomIn}
        className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-5 w-5" />
      </button>
      <div className="w-px h-8 bg-slate-200 mx-1" />
      <button
        type="button"
        onClick={onFit}
        className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
      >
        <Scan className="h-4 w-4" />
        Fit to Screen
      </button>
      <button
        type="button"
        onClick={onAutoLayout}
        className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
      >
        <LayoutGrid className="h-4 w-4" />
        Auto layout
      </button>
      <div className="ml-2 pr-2 text-xs font-semibold text-slate-500">{zoomPercent}%</div>
    </div>
  );
}


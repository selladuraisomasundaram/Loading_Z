"use client";

import React from "react";
import { Cpu, CheckCircle2, Activity } from "lucide-react";
import { ToolStep } from "@/types";

export interface ToolActivityPanelProps {
  toolSteps?: ToolStep[];
  isProcessing?: boolean;
}

export const ToolActivityPanel: React.FC<ToolActivityPanelProps> = ({
  toolSteps = [
    { step: "🧠 Intent Analysis", action: "Parsed user query & intent context" },
    { step: "🔎 Catalog Query", action: "Matched SKU database entries" },
    { step: "📍 Aisle Resolution", action: "Resolved store layout coordinates" },
    { step: "🗺 Path Calculation", action: "Calculated shortest aisle route" },
    { step: "✓ Response Synthesized", action: "Formatted assistant response payload" },
  ],
  isProcessing = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md text-white space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm tracking-tight">
              Gemma Tool Activity Panel
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live function orchestration telemetry
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold rounded-full">
          <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
          {isProcessing ? "Executing..." : "Idle / Complete"}
        </span>
      </div>

      {/* Step Orchestration Feed */}
      <div className="space-y-2.5 text-xs">
        {toolSteps.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start space-x-3 transition-colors hover:border-slate-700"
          >
            <div className="p-1 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between">
                <span>{item.step}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  Step {idx + 1}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {item.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolActivityPanel;

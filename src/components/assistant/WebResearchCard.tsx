"use client";

import React from "react";
import { Globe, Search, ExternalLink } from "lucide-react";
import { WebSearchPayload } from "@/types";

export interface WebResearchCardProps {
  researchData?: WebSearchPayload;
}

export const WebResearchCard: React.FC<WebResearchCardProps> = ({
  researchData = {
    query: "What pairs best with Maggi Instant Noodles?",
    sources: ["recipehub.org", "openfoodfacts.org", "nestle.in"],
    summary:
      "Top recommended pairings include Heinz Tomato Ketchup, Melted Amul Processed Cheese, Sweet Corn, and Oregano Seasoning.",
  },
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md text-white space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm tracking-tight">
              Web Research Panel
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Gemma External Web Knowledge Engine
            </p>
          </div>
        </div>

        <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Web Grounded
        </span>
      </div>

      {/* Query Bar */}
      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-300">
        <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="font-mono text-slate-200 truncate">
          &quot;{researchData.query}&quot;
        </span>
      </div>

      {/* Domain Source Badges */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Source Knowledge Domains
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {researchData.sources.map((domain, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg font-mono"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              {domain}
            </span>
          ))}
        </div>
      </div>

      {/* Findings Summary */}
      <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
          Summarized Findings
        </span>
        <p className="leading-relaxed font-sans text-slate-200">
          {researchData.summary}
        </p>
      </div>
    </div>
  );
};

export default WebResearchCard;

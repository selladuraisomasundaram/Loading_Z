"use client";

import React, { useState } from "react";
import { Settings, Sliders, Shield, Radio, RefreshCw, Save } from "lucide-react";

export const SettingsView: React.FC = () => {
  const [useMockApi, setUseMockApi] = useState(true);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");

  const handleSave = () => {
    alert("Settings saved locally.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            System & Hardware Settings
          </h2>
          <p className="text-xs text-slate-500">
            Configure API endpoints, hardware telemetry mode, and preferences
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Mock API Toggle */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <Sliders className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Development Mock API Mode
              </h4>
              <p className="text-slate-500 mt-0.5">
                Use client-side mock data when backend FastAPI server is offline
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useMockApi}
              onChange={(e) => setUseMockApi(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600" />
          </label>
        </div>

        {/* Backend Endpoint Config */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="font-bold text-slate-900 text-sm block">
            FastAPI Backend Endpoint URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Hardware Diagnostics & Calibration
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
              <span className="text-slate-600 font-medium">HX711 Scale Tare Calibration</span>
              <button
                type="button"
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-sky-600" /> Tare Scale
              </button>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
              <span className="text-slate-600 font-medium">Camera Stream Status</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> 1080p 30fps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

"use client";

import React from "react";
import Header from "@/components/ui/Header";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import ProductDetection from "@/components/dashboard/ProductDetection";
import LoadCellCard from "@/components/dashboard/LoadCellCard";
import CartPanel from "@/components/dashboard/CartPanel";
import BillingSummary from "@/components/dashboard/BillingSummary";
import RecommendationPanel from "@/components/dashboard/RecommendationPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header title="Smart Trolley Frontend Assistant" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Telemetry Bar */}
        <StatusIndicator />

        {/* Placeholder Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vision & Sensor Input Placeholders */}
          <div className="lg:col-span-2 space-y-6">
            <ProductDetection />
            <LoadCellCard />
            <CartPanel />
          </div>

          {/* Right Column: Billing & Smart Recommendations */}
          <div className="space-y-6">
            <BillingSummary />
            <RecommendationPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

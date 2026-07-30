"use client";

import React from "react";
import Header from "@/components/ui/Header";
import ProductIdentification from "@/components/dashboard/ProductIdentification";
import GemmaResult from "@/components/dashboard/GemmaResult";
import CartSection from "@/components/dashboard/CartSection";
import LoadCellTelemetry from "@/components/dashboard/LoadCellTelemetry";
import RecommendationsSection from "@/components/dashboard/RecommendationsSection";
import BillingSummarySection from "@/components/dashboard/BillingSummarySection";

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Grid: Desktop-first 3-column layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Product Identification & Gemma Result (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <ProductIdentification />
            <GemmaResult />
          </div>

          {/* CENTER COLUMN: Active Cart & Load Cell Telemetry (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <CartSection />
            <LoadCellTelemetry />
          </div>

          {/* RIGHT COLUMN: AI Recommendations & Billing Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <RecommendationsSection />
            <BillingSummarySection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

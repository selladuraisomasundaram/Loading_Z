"use client";

import React from "react";
import { Receipt, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export const BillingSummarySection: React.FC = () => {
  const { billingSummary, clearCart } = useCart();

  const handleCheckout = () => {
    alert(
      `Checkout successful! Total amount paid: ${formatCurrency(
        billingSummary.finalPayableAmount
      )}`
    );
    clearCart();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
        <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Billing Summary
          </h3>
          <p className="text-xs text-slate-500">
            Automated tax calculation & express payment breakdown
          </p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-700">
          <span className="font-semibold">
            Total Item Count ({billingSummary.itemCount} items)
          </span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {billingSummary.itemCount}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Subtotal</span>
          <span className="font-bold font-mono">
            {formatCurrency(billingSummary.subtotal)}
          </span>
        </div>

        {billingSummary.discount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            <span>Special Promotional Discount</span>
            <span className="font-bold font-mono">
              -{formatCurrency(billingSummary.discount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600">
          <span>GST Rate ({billingSummary.gstRatePercent}%)</span>
          <span className="font-bold font-mono">
            {formatCurrency(billingSummary.gstAmount)}
          </span>
        </div>

        {/* Final Payable Amount in Gold/Yellow Highlight */}
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between mt-2">
          <div>
            <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">
              Final Payable Amount
            </span>
            <span className="text-[10px] text-amber-700">
              Inclusive of all taxes & discounts
            </span>
          </div>
          <span className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {formatCurrency(billingSummary.finalPayableAmount)}
          </span>
        </div>
      </div>

      <div className="pt-1 space-y-2">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={billingSummary.itemCount === 0}
          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay & Express Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Verified Weight & AI Double-Verification Secured</span>
        </div>
      </div>
    </div>
  );
};

export default BillingSummarySection;

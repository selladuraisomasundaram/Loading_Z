"use client";

import React from "react";
import { Receipt, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export interface BillingSummaryProps {
  onCheckout?: () => void;
}

export const BillingSummary: React.FC<BillingSummaryProps> = ({
  onCheckout,
}) => {
  const { billingSummary } = useCart();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-base">
            Billing Summary
          </h3>
          <p className="text-xs text-slate-400">
            Automated calculated totals & taxes
          </p>
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal ({billingSummary.itemCount} items)</span>
          <span className="font-mono">
            {formatCurrency(billingSummary.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-slate-400 text-xs">
          <span>Estimated Sales Tax (8%)</span>
          <span className="font-mono">{formatCurrency(billingSummary.tax)}</span>
        </div>

        {billingSummary.discount > 0 && (
          <div className="flex justify-between text-emerald-400 text-xs">
            <span>Special Trolley Discount</span>
            <span className="font-mono">
              -{formatCurrency(billingSummary.discount)}
            </span>
          </div>
        )}

        <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
          <span className="font-bold text-slate-100 text-base">Total Amount</span>
          <span className="font-extrabold text-xl text-emerald-400 font-mono">
            {formatCurrency(billingSummary.total)}
          </span>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={onCheckout}
          disabled={billingSummary.itemCount === 0}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
        >
          <CreditCard className="w-4 h-4" />
          Proceed to Express Checkout
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Verified Weight & Camera Match Protection
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;

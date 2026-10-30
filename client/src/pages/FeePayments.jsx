import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  Receipt,
  ShieldCheck,
  QrCode
} from "lucide-react";
import { Modal } from "../components/Modal";
import { api } from "../services/api";
import confetti from "canvas-confetti";

export function FeePayments({ feesData, onUpdateFees }) {
  const { currentPersona } = useAuth();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentMode, setPaymentMode] = useState("UPI / Google Pay");
  const [isProcessing, setIsProcessing] = useState(false);

  const transactions = feesData?.transactions || [];
  const pendingTxn = transactions.find((t) => t.status === "Pending");
  const totalAnnual = feesData?.totalAnnualFee || 145000;
  const totalPaid = feesData?.totalPaid || 115000;
  const pendingBalance = feesData?.pendingBalance ?? 30000;

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!pendingTxn) return;

    try {
      setIsProcessing(true);
      const res = await api.payFee({
        receiptNo: pendingTxn.receiptNo,
        paymentMethod: paymentMode
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onUpdateFees) {
        onUpdateFees(res.updatedFees);
      }

      setIsPayModalOpen(false);
      setSelectedReceipt(res.receipt);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Fee Accounts & Payment Receipts</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-4 h-4" />
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          University accounts division • Academic Year 2026-2027 fee records and official receipts.
        </p>
      </div>

      {/* Fee Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Annual Academic Fee
          </span>
          <p className="text-3xl font-extrabold text-white mt-2">
            ₹{totalAnnual.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Tuition, lab, library & amenities</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Amount Paid
            </span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cleared via verified bank gateway</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Pending Dues
            </span>
            {pendingBalance > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                DUE NOV 15
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ALL CLEARED
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            ₹{pendingBalance.toLocaleString("en-IN")}
          </p>
          {pendingBalance > 0 ? (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pay Dues Now</span>
            </button>
          ) : (
            <p className="text-[11px] text-emerald-400 mt-2">No active dues on student account</p>
          )}
        </div>
      </div>

      {/* Transaction Records */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Fee Invoices & Historical Receipts
        </h3>

        <div className="space-y-3">
          {transactions.map((txn) => {
            const isPaid = txn.status === "Paid";

            return (
              <div
                key={txn.receiptNo}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    isPaid ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    <Receipt className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {txn.receiptNo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {txn.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{txn.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isPaid ? `Paid on ${txn.paidDate} • ${txn.mode}` : `Payment deadline: ${txn.dueDate}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-white">
                      ₹{txn.amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {isPaid ? (
                    <button
                      onClick={() => setSelectedReceipt(txn)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Receipt</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPayModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      Pay Online
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pay Dues Simulation Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="CampusX Digital Payment Gateway"
        subtitle={`Clearing Invoice ${pendingTxn?.receiptNo} • Amount: ₹${pendingBalance.toLocaleString("en-IN")}`}
      >
        <form onSubmit={handlePayFee} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Student Roll No:</span>
              <span className="font-mono text-white font-semibold">{currentPersona?.rollNo || "2304920100148"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Due Amount:</span>
              <span className="font-bold text-emerald-400 text-sm">₹{pendingBalance.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Payment Method</label>
            <div className="space-y-2">
              {[
                "UPI (Google Pay / PhonePe / Paytm)",
                "Debit / Credit Card (Visa / Mastercard / RuPay)",
                "Net Banking (HDFC, SBI, ICICI, Axis)",
                "Campus Education Loan Portal"
              ].map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMode === mode
                      ? "bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/30"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-medium">{mode}</span>
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={paymentMode === mode}
                    onChange={() => setPaymentMode(mode)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isProcessing ? "Processing..." : `Confirm Payment of ₹${pendingBalance.toLocaleString("en-IN")}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Fee Payment Receipt"
          subtitle="KCC Institute of Technology and Management • Accounts Directorate"
        >
          <div className="space-y-5 p-2 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs">
            {/* College header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-white">KCC Institute of Technology and Management</h4>
                <p className="text-[11px] text-slate-400">Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU)</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Receipt: {selectedReceipt.receiptNo}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <QrCode className="w-10 h-10 text-slate-300" />
              </div>
            </div>

            {/* Student info */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <p className="font-semibold text-white">{currentPersona?.name || "Aryan Sachan"}</p>
              </div>
              <div>
                <span className="text-slate-500">Roll Number:</span>
                <p className="font-mono font-semibold text-white">{currentPersona?.rollNo || "2304920100148"}</p>
              </div>
              <div>
                <span className="text-slate-500">Department & Sem:</span>
                <p className="text-slate-300">CSE • Semester 6</p>
              </div>
              <div>
                <span className="text-slate-500">Payment Status:</span>
                <span className="text-emerald-400 font-bold">PAID (VERIFIED)</span>
              </div>
            </div>

            {/* Itemized table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-2.5 bg-slate-900 font-semibold text-slate-300 flex justify-between">
                <span>Fee Component</span>
                <span>Amount (INR)</span>
              </div>
              <div className="p-2.5 flex justify-between border-t border-slate-800/80">
                <span className="text-slate-300">{selectedReceipt.title}</span>
                <span className="font-mono font-bold text-white">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400">
              Payment Reference: {selectedReceipt.mode || "Online Gateway"} • Date: {selectedReceipt.paidDate || "Recent"}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Digitally Generated & Verified
              </span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

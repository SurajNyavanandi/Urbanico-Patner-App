import React from 'react';
import { X, Scale, FileText, Printer } from 'lucide-react';
import { ConsignmentDelivery } from '../../types';
import { audioHaptics } from '../../services/audioHaptics';

interface WeighbridgeSlipModalProps {
  consignment: ConsignmentDelivery;
  onClose: () => void;
}

export const WeighbridgeSlipModal: React.FC<WeighbridgeSlipModalProps> = ({ consignment, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-t-[24px] sm:rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#FCB026]" />
            <h3 className="font-extrabold text-base">Weight Slip</h3>
          </div>
          <button
            onClick={() => {
              audioHaptics.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Material Name Banner */}
          <div className="p-3.5 rounded-[16px] bg-[#FFF8EB] dark:bg-amber-950/40 border border-[#FCB026]/40">
            <span className="text-[10px] font-extrabold uppercase text-[#B45309] dark:text-[#FCB026] block mb-0.5">
              Material Loaded
            </span>
            <p className="font-extrabold text-sm text-[#18181B] dark:text-white">{consignment.cargoDescription}</p>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">Quarry Gate Pass: {consignment.quarryGatePass}</p>
          </div>

          {/* 3 Clean Weight Numbers */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-[14px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-[#64748B] block mb-1">Total Weight</span>
              <span className="text-base font-black text-[#18181B] dark:text-white font-mono">
                {((consignment.grossWeightKg ?? consignment.grossWeight * 1000) || 26500).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">kg</span>
              </span>
            </div>

            <div className="p-3 rounded-[14px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-[#64748B] block mb-1">Truck Weight</span>
              <span className="text-base font-black text-[#18181B] dark:text-white font-mono">
                {((consignment.tareWeightKg ?? consignment.tareWeight * 1000) || 16500).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">kg</span>
              </span>
            </div>

            <div className="p-3 rounded-[14px] bg-[#FFF8EB] dark:bg-amber-950/40 border border-[#FCB026]">
              <span className="text-[10px] font-extrabold text-[#B45309] dark:text-[#FCB026] block mb-1">Net Material</span>
              <span className="text-base font-black text-[#18181B] dark:text-[#FCB026] font-mono">
                {(consignment.netPayload || 10).toFixed(1)} <span className="text-[10px] font-extrabold">Tons</span>
              </span>
            </div>
          </div>

          {/* E-Way Bill Box */}
          <div className="p-3.5 rounded-[16px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs flex items-center gap-1.5">
                <FileText size={14} className="text-[#0284C7]" />
                <span>Government E-Way Bill Number</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Valid</span>
            </div>
            <p className="font-mono text-base font-extrabold tracking-wide text-[#18181B] dark:text-white">
              {consignment.eWayBillNo}
            </p>
          </div>

          {/* Vehicle info */}
          <div className="text-xs text-[#64748B] dark:text-slate-400 flex items-center justify-between pt-1">
            <span>Vehicle: {consignment.vehicleNumber}</span>
            <span>Driver: Raju</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => {
              audioHaptics.playTap();
              onClose();
            }}
            className="flex-1 py-3 rounded-[12px] bg-slate-200 dark:bg-slate-800 text-[#18181B] dark:text-white font-extrabold text-xs cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              audioHaptics.playTap();
              window.print();
            }}
            className="flex-1 py-3 rounded-[12px] bg-[#FCB026] text-[#18181B] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            <span>Print Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

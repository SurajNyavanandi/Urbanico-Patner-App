import React, { useState } from 'react';
import { X, Calculator, Plus, Trash2, Send, CheckCircle2, Wrench, Package, Users } from 'lucide-react';
import { ServiceOrder } from '../../types';
import { api } from '../../services/api';
import { audioHaptics } from '../../services/audioHaptics';

interface PostVisitBoqModalProps {
  order: ServiceOrder;
  isOffline?: boolean;
  onClose: () => void;
  onQuoteSubmitted: (updatedOrder: ServiceOrder) => void;
}

export const PostVisitBoqModal: React.FC<PostVisitBoqModalProps> = ({
  order,
  isOffline = false,
  onClose,
  onQuoteSubmitted
}) => {
  // Measurements
  const [areaSqFt, setAreaSqFt] = useState<number>(order.measurements?.areaSqFt || 2400);
  const [runningMeters, setRunningMeters] = useState<number>(order.measurements?.runningMeters || 45);
  const [unitDescription, setUnitDescription] = useState<string>(
    order.measurements?.unitDescription || 'Second Floor Slab & Overhang Cantilever'
  );

  // Workers Needed
  const [masons, setMasons] = useState<number>(order.crewComposition?.masons || 6);
  const [helpers, setHelpers] = useState<number>(order.crewComposition?.helpers || 4);
  const [days, setDays] = useState<number>(order.crewComposition?.daysEstimate || 2);
  const masonRate = 850;
  const helperRate = 550;

  // Machines Needed
  const [machinery, setMachinery] = useState<Array<{ name: string; quantity: number; cost: number }>>(
    order.machineryRequirements || [
      { name: 'Needle Vibrator (Petrol)', quantity: 2, cost: 3000 },
      { name: 'Mini Batch Concrete Mixer', quantity: 1, cost: 4500 }
    ]
  );

  // Materials Needed
  const [materials, setMaterials] = useState<Array<{ name: string; quantity: string; cost: number }>>(
    order.materialRequisitions || [
      { name: 'UltraTech PPC Cement (50kg)', quantity: '80 Bags', cost: 30800 },
      { name: 'Zone II M-Sand', quantity: '4 Tons', cost: 6600 }
    ]
  );

  // Notes
  const [inspectionNotes, setInspectionNotes] = useState<string>(
    order.inspectionNotes || 'Foundation bedrock verified. Excavation requires heavy rock breaker attachment.'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customerModalPreview, setCustomerModalPreview] = useState<boolean>(false);

  // Math
  const laborEstimate = (masons * masonRate + helpers * helperRate) * days;
  const machineryRental = machinery.reduce((sum, item) => sum + item.cost, 0);
  const materialEstimate = materials.reduce((sum, item) => sum + item.cost, 0);
  const subtotal = materialEstimate + laborEstimate + machineryRental;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalPayable = subtotal + gstAmount;

  const handleAddMachinery = () => {
    audioHaptics.playTap();
    setMachinery([...machinery, { name: 'Heavy Rock Breaker', quantity: 1, cost: 6000 }]);
  };

  const handleRemoveMachinery = (index: number) => {
    audioHaptics.playTap();
    setMachinery(machinery.filter((_, i) => i !== index));
  };

  const handleAddMaterial = () => {
    audioHaptics.playTap();
    setMaterials([...materials, { name: '20mm Granite Stones', quantity: '8 Tons', cost: 11600 }]);
  };

  const handleRemoveMaterial = (index: number) => {
    audioHaptics.playTap();
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmitQuote = async () => {
    audioHaptics.playTap();
    setIsSubmitting(true);

    const payload = {
      serviceOrderId: order.id,
      siteInspectionNotes: inspectionNotes,
      measurements: { areaSqFt, runningMeters, unitDescription },
      crewComposition: { masons, helpers, daysEstimate: days },
      machineryRequirements: machinery,
      materialRequisitions: materials,
      revisedMaterialEstimate: materialEstimate,
      revisedLaborEstimate: laborEstimate,
      machineryRental,
      totalPayable,
      customerConfirmationRequested: true
    };

    const res = await api.submitPostVisitQuote(payload);
    setIsSubmitting(false);

    if (res.success) {
      audioHaptics.playSuccess();
      setCustomerModalPreview(true);
    }
  };

  const finalizeAndClose = () => {
    const updated: ServiceOrder = {
      ...order,
      status: 'quote_submitted',
      inspectionNotes,
      measurements: { areaSqFt, runningMeters, unitDescription },
      crewComposition: { masons, helpers, daysEstimate: days },
      machineryRequirements: machinery,
      materialRequisitions: materials,
      revisedMaterialEstimate: materialEstimate,
      revisedLaborEstimate: laborEstimate,
      machineryRental,
      gstAmount,
      totalPayable,
      customerConfirmationRequested: true
    };
    onQuoteSubmitted(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#1E293B] text-[#18181B] dark:text-white w-full max-w-lg rounded-t-[24px] sm:rounded-[24px] border border-slate-200 dark:border-[#334155] shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base">Create Work & Material Quote</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{order.customerName} · {order.serviceName}</p>
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
          {/* Section 1: Measurements */}
          <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="font-extrabold text-xs uppercase tracking-wide text-[#0284C7] block">
              1. Site Measurements
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                  Floor Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={areaSqFt}
                  onChange={e => setAreaSqFt(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 py-2 font-bold text-sm text-[#18181B] dark:text-white outline-none focus:border-[#FCB026]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                  Length / Perimeter (Meters)
                </label>
                <input
                  type="number"
                  value={runningMeters}
                  onChange={e => setRunningMeters(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 py-2 font-bold text-sm text-[#18181B] dark:text-white outline-none focus:border-[#FCB026]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                Description of Area
              </label>
              <input
                type="text"
                value={unitDescription}
                onChange={e => setUnitDescription(e.target.value)}
                className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 py-2 text-xs text-[#18181B] dark:text-white outline-none focus:border-[#FCB026]"
              />
            </div>
          </div>

          {/* Section 2: Workers Needed */}
          <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wide text-[#FCB026] flex items-center gap-1.5">
                <Users size={15} />
                <span>2. Workers Needed</span>
              </span>
              <span className="font-black text-xs text-[#18181B] dark:text-white">
                ₹{laborEstimate.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-[#64748B] block mb-1">Masons (₹850/day)</span>
                <input
                  type="number"
                  min={1}
                  value={masons}
                  onChange={e => setMasons(Math.max(1, Number(e.target.value)))}
                  className="w-14 mx-auto text-center font-extrabold text-base bg-transparent outline-none border-b-2 border-[#FCB026]"
                />
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-[#64748B] block mb-1">Helpers (₹550/day)</span>
                <input
                  type="number"
                  min={1}
                  value={helpers}
                  onChange={e => setHelpers(Math.max(1, Number(e.target.value)))}
                  className="w-14 mx-auto text-center font-extrabold text-base bg-transparent outline-none border-b-2 border-[#FCB026]"
                />
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-[#64748B] block mb-1">Days of Work</span>
                <input
                  type="number"
                  min={1}
                  value={days}
                  onChange={e => setDays(Math.max(1, Number(e.target.value)))}
                  className="w-14 mx-auto text-center font-extrabold text-base bg-transparent outline-none border-b-2 border-[#FCB026]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Machines Needed */}
          <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wrench size={14} className="text-[#0284C7]" />
                <span>3. Machines Needed</span>
              </span>
              <span className="font-black text-xs">
                ₹{machineryRental.toLocaleString()}
              </span>
            </div>

            {machinery.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-[10px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="font-bold">{item.name}</span>
                  <span className="text-[11px] text-[#64748B] block">Quantity: {item.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">₹{item.cost.toLocaleString()}</span>
                  <button
                    onClick={() => handleRemoveMachinery(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddMachinery}
              className="w-full py-2 rounded-[10px] border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FCB026] text-xs font-bold text-[#64748B] flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Machine (e.g. Rock Breaker)</span>
            </button>
          </div>

          {/* Section 4: Materials Needed */}
          <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Package size={14} className="text-amber-500" />
                <span>4. Materials Needed</span>
              </span>
              <span className="font-black text-xs">
                ₹{materialEstimate.toLocaleString()}
              </span>
            </div>

            {materials.map((mat, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-[10px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="font-bold">{mat.name}</span>
                  <span className="text-[11px] text-[#FCB026] font-bold block">{mat.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">₹{mat.cost.toLocaleString()}</span>
                  <button
                    onClick={() => handleRemoveMaterial(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddMaterial}
              className="w-full py-2 rounded-[10px] border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FCB026] text-xs font-bold text-[#64748B] flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Material (Cement, Sand, Stones)</span>
            </button>
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block mb-1">
              Site Notes & Hazards
            </label>
            <textarea
              rows={2}
              value={inspectionNotes}
              onChange={e => setInspectionNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-[12px] p-3 text-xs outline-none focus:border-[#FCB026]"
            />
          </div>

          {/* Clean Apple Total Summary Box */}
          <div className="p-4 rounded-[18px] bg-[#FFF8EB] dark:bg-amber-950/40 border border-[#FCB026] space-y-1.5">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>Materials:</span>
              <span className="font-bold">₹{materialEstimate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>Workers Labor:</span>
              <span className="font-bold">₹{laborEstimate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>Machines Rental:</span>
              <span className="font-bold">₹{machineryRental.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>18% Government GST:</span>
              <span className="font-bold">₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-amber-300 dark:border-amber-800 flex justify-between items-center">
              <span className="font-extrabold text-sm">Total Cost to Customer:</span>
              <span className="font-black text-xl text-[#18181B] dark:text-[#FCB026]">
                ₹{totalPayable.toLocaleString()}
              </span>
            </div>
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
            Cancel
          </button>
          <button
            onClick={handleSubmitQuote}
            disabled={isSubmitting}
            className="flex-2 py-3 rounded-[12px] bg-[#FCB026] hover:bg-[#e09b1f] text-[#18181B] font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Sending...' : 'Send Quote to Customer'}</span>
          </button>
        </div>
      </div>

      {/* Customer Notification Confirmation Modal */}
      {customerModalPreview && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#10B981] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className="text-lg font-extrabold">Quote Sent to Customer!</h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                Sent to {order.customerName} ({order.customerPhone})
              </p>
            </div>

            <div className="p-3.5 rounded-[16px] bg-slate-50 dark:bg-[#1E293B] text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total Amount:</span>
                <span className="font-black text-[#FCB026] text-sm">₹{totalPayable.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                Customer received an SMS with a direct "Approve & Pay" link.
              </p>
            </div>

            <button
              onClick={() => {
                audioHaptics.playTap();
                setCustomerModalPreview(false);
                finalizeAndClose();
              }}
              className="w-full h-12 rounded-[12px] bg-[#FCB026] hover:bg-[#e09b1f] text-[#18181B] font-black text-xs flex items-center justify-center cursor-pointer"
            >
              Done · Back to Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

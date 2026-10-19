import React from 'react';
import { MapPin, Phone, Clock, Calculator } from 'lucide-react';
import { ServiceOrder } from '../../types';
import { audioHaptics } from '../../services/audioHaptics';

interface ServiceVisitCardProps {
  order: ServiceOrder;
  isNightMode?: boolean;
  onCheckInGps: (order: ServiceOrder) => void;
  onOpenBoq: (order: ServiceOrder) => void;
}

export const ServiceVisitCard: React.FC<ServiceVisitCardProps> = ({
  order,
  isNightMode = false,
  onCheckInGps,
  onOpenBoq
}) => {
  const isCheckedIn = order.status === 'arrived_on_site' || order.status === 'quote_submitted' || order.status === 'customer_approved';
  const hasQuote = order.status === 'quote_submitted' || order.status === 'customer_approved';

  const handleCall = () => {
    audioHaptics.playTap();
    window.location.href = `tel:${order.customerPhone}`;
  };

  return (
    <div className={`rounded-[16px] border p-4 mb-3.5 shadow-xs transition-all ${
      isNightMode ? 'bg-[#1E293B] border-[#334155] text-white' : 'bg-white border-[#E2E8F0] text-[#18181B]'
    }`}>
      {/* Header: Order ID & Booking Fee */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-extrabold tracking-tight">{order.id}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-[6px] bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] border border-sky-200 dark:border-sky-800">
            ₹{order.baseBookingFee} Visit Fee
          </span>
        </div>

        <div className={`px-2.5 py-1 rounded-[6px] text-xs font-bold ${
          hasQuote
            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
            : isCheckedIn
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981]'
            : 'bg-[#FFF8EB] dark:bg-amber-950/60 text-[#B45309] dark:text-[#FCB026]'
        }`}>
          {hasQuote ? 'Quote Sent' : isCheckedIn ? 'At the Site' : 'Scheduled Visit'}
        </div>
      </div>

      {/* Service Name */}
      <h3 className="text-base font-extrabold mb-1 leading-snug">
        {order.serviceName}
      </h3>

      {/* Customer & Time */}
      <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8] mb-2.5">
        <span className="font-bold text-[#18181B] dark:text-white">{order.customerName}</span>
        <span>·</span>
        <div className="flex items-center gap-1 font-medium">
          <Clock size={12} />
          <span>{order.scheduledTimeSlot}</span>
        </div>
      </div>

      {/* Site Address */}
      <div className="flex items-start gap-2 text-xs mb-3.5">
        <MapPin size={16} className="text-[#FCB026] shrink-0 mt-0.5" />
        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
          {order.siteAddress}
        </span>
      </div>

      {/* Quote summary if already drafted */}
      {order.totalPayable && order.totalPayable > 0 && (
        <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 mb-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 block font-bold">Total Quote Price:</span>
            <span className="text-base font-black text-[#FCB026]">₹{order.totalPayable.toLocaleString()}</span>
          </div>
          <span className="text-xs font-bold text-[#10B981]">Customer Approval Sent</span>
        </div>
      )}

      {/* Action Buttons (Large Apple-style targets >= 48px) */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCall}
          className="h-12 px-3.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#18181B] dark:text-white flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
        >
          <Phone size={15} className="text-[#0284C7]" />
          <span>Call Customer</span>
        </button>

        {!isCheckedIn ? (
          <button
            onClick={() => {
              audioHaptics.playTap();
              onCheckInGps(order);
            }}
            className="flex-1 h-12 rounded-[12px] bg-[#0284C7] hover:bg-[#0369a1] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <MapPin size={15} />
            <span>I Have Reached the Site</span>
          </button>
        ) : (
          <button
            onClick={() => {
              audioHaptics.playTap();
              onOpenBoq(order);
            }}
            className="flex-1 h-12 rounded-[12px] bg-[#FCB026] hover:bg-[#e09b1f] text-[#18181B] font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Calculator size={15} />
            <span>{hasQuote ? 'Edit Quote' : 'Create Work & Material Quote'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

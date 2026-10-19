import React, { useState, useEffect } from 'react';
import { HardHat, CheckCircle2 } from 'lucide-react';
import { ServiceOrder, PartnerUser } from '../../types';
import { api } from '../../services/api';
import { ServiceVisitCard } from './ServiceVisitCard';
import { GpsCheckInModal } from './GpsCheckInModal';
import { PostVisitBoqModal } from './PostVisitBoqModal';

interface TechnicianDashboardProps {
  user: PartnerUser;
  isNightMode?: boolean;
  isOffline?: boolean;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  user,
  isNightMode = false,
  isOffline = false
}) => {
  const [services, setServices] = useState<ServiceOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending_checkin' | 'quoted'>('all');
  const [selectedCheckIn, setSelectedCheckIn] = useState<ServiceOrder | null>(null);
  const [selectedBoq, setSelectedBoq] = useState<ServiceOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadServices = async () => {
    const list = await api.getAssignedServices();
    setServices(list);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCheckInDone = (updated: ServiceOrder) => {
    setSelectedCheckIn(null);
    setServices(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setSelectedBoq(updated); // Open quote creator immediately
  };

  const handleQuoteDone = (updated: ServiceOrder) => {
    setSelectedBoq(null);
    setServices(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setToastMessage(`Work quote for ${updated.customerName} sent successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filtered = services.filter(s => {
    if (activeTab === 'pending_checkin') return s.status === 'scheduled' || s.status === 'technician_en_route';
    if (activeTab === 'quoted') return s.status === 'quote_submitted' || s.status === 'customer_approved';
    return true;
  });

  const quotesCount = services.filter(s => s.status === 'quote_submitted' || s.status === 'customer_approved').length;

  return (
    <div className="p-4 space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-[14px] bg-[#10B981] text-white font-extrabold text-xs flex items-center gap-2 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Contractor Info Banner */}
      <div className={`p-4 rounded-[18px] border ${
        isNightMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
      } shadow-xs flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-[#0284C7] text-white flex items-center justify-center font-black">
            <HardHat size={22} />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight">{user.name}</span>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
              {user.tradeSpecialty || 'Concrete & Structural Masonry'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-[#FCB026] block">4.9 ★</span>
          <span className="text-xs text-[#64748B]">142 Jobs</span>
        </div>
      </div>

      {/* 3 Clean Apple Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className={`p-3.5 rounded-[16px] border text-center ${
          isNightMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
        } shadow-xs`}>
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Today's Visits</span>
          <span className="text-xl font-black text-[#0284C7]">{services.length}</span>
        </div>

        <div className={`p-3.5 rounded-[16px] border text-center ${
          isNightMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
        } shadow-xs`}>
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Visit Fee</span>
          <span className="text-xl font-black text-emerald-600">₹99</span>
        </div>

        <div className={`p-3.5 rounded-[16px] border text-center ${
          isNightMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
        } shadow-xs`}>
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Quotes Sent</span>
          <span className="text-xl font-black text-[#FCB026]">{quotesCount}</span>
        </div>
      </div>

      {/* Simple Instruction Card */}
      <div className="p-3.5 rounded-[16px] bg-[#FFF8EB] dark:bg-amber-950/30 border border-[#FCB026]/40 text-xs">
        <p className="font-bold text-amber-900 dark:text-[#FCB026] mb-0.5">How Site Visits Work:</p>
        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
          The customer booked a ₹99 inspection. When you reach their site, measure the area and create a quote for workers, machines, and materials so the customer can approve it.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-extrabold tracking-tight">Today's Site Visits</h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-[10px] text-xs font-bold border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#1E293B] text-[#18181B] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            All ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('pending_checkin')}
            className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${
              activeTab === 'pending_checkin'
                ? 'bg-white dark:bg-[#1E293B] text-[#18181B] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            Need to Visit
          </button>
          <button
            onClick={() => setActiveTab('quoted')}
            className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${
              activeTab === 'quoted'
                ? 'bg-white dark:bg-[#1E293B] text-[#18181B] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            Quotes Sent ({quotesCount})
          </button>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {filtered.map(order => (
          <ServiceVisitCard
            key={order.id}
            order={order}
            isNightMode={isNightMode}
            onCheckInGps={s => setSelectedCheckIn(s)}
            onOpenBoq={s => setSelectedBoq(s)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#64748B] text-xs">
            No visits in this section.
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCheckIn && (
        <GpsCheckInModal
          order={selectedCheckIn}
          onClose={() => setSelectedCheckIn(null)}
          onCheckInSuccess={handleCheckInDone}
        />
      )}

      {selectedBoq && (
        <PostVisitBoqModal
          order={selectedBoq}
          isOffline={isOffline}
          onClose={() => setSelectedBoq(null)}
          onQuoteSubmitted={handleQuoteDone}
        />
      )}
    </div>
  );
};

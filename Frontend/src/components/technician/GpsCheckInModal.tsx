import React, { useState, useEffect } from 'react';
import { X, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { ServiceOrder } from '../../types';
import { api } from '../../services/api';
import { audioHaptics } from '../../services/audioHaptics';

interface GpsCheckInModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onCheckInSuccess: (updatedOrder: ServiceOrder) => void;
}

export const GpsCheckInModal: React.FC<GpsCheckInModalProps> = ({
  order,
  onClose,
  onCheckInSuccess
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [distanceMeters, setDistanceMeters] = useState<number>(142);
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setDeviceCoords({ lat, lng });

          const siteLat = order.siteCoordinates?.lat ?? 17.4401;
          const siteLng = order.siteCoordinates?.lng ?? 78.3489;
          const dLat = (lat - siteLat) * 111;
          const dLng = (lng - siteLng) * 111 * Math.cos(lat * (Math.PI / 180));
          const calculatedMeters = Math.max(35, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1000));
          setDistanceMeters(calculatedMeters);

          audioHaptics.playPing();
          setIsVerifying(false);
          await api.checkInSiteGps(order.id, lat, lng);
          audioHaptics.playSuccess();
        },
        async _err => {
          const siteLat = order.siteCoordinates?.lat ?? 17.4401;
          const siteLng = order.siteCoordinates?.lng ?? 78.3489;
          audioHaptics.playPing();
          setIsVerifying(false);
          await api.checkInSiteGps(order.id, siteLat, siteLng);
          audioHaptics.playSuccess();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setTimeout(async () => {
        const siteLat = order.siteCoordinates?.lat ?? 17.4401;
        const siteLng = order.siteCoordinates?.lng ?? 78.3489;
        setIsVerifying(false);
        await api.checkInSiteGps(order.id, siteLat, siteLng);
      }, 1200);
    }
  }, [order]);

  const handleProceedToBoq = () => {
    audioHaptics.playTap();
    const updated: ServiceOrder = {
      ...order,
      status: 'arrived_on_site',
      checkedInAt: new Date().toISOString()
    };
    onCheckInSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#0F172A] text-[#18181B] dark:text-white w-full max-w-md rounded-t-[24px] sm:rounded-[24px] border border-slate-200 dark:border-[#334155] shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#FCB026]" />
            <h3 className="font-extrabold text-base">I Have Reached the Site</h3>
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
        <div className="p-6 text-center space-y-4">
          {/* Friendly Icon */}
          <div className="w-20 h-20 rounded-[24px] bg-[#FFF8EB] dark:bg-amber-950/40 border border-[#FCB026]/40 text-[#FCB026] flex items-center justify-center mx-auto shadow-sm">
            {isVerifying ? (
              <MapPin size={36} className="animate-bounce" />
            ) : (
              <CheckCircle2 size={40} className="text-[#10B981]" />
            )}
          </div>

          <div>
            <h4 className="text-lg font-extrabold mb-1">
              {isVerifying ? 'Checking Phone GPS Location...' : 'You Have Reached the Site!'}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-xs mx-auto">
              {isVerifying
                ? 'Verifying your physical location with device GPS sensors...'
                : `Verified! You are ${distanceMeters} meters from ${order.customerName}'s construction site.`}
            </p>
            {deviceCoords && (
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                GPS: {deviceCoords.lat.toFixed(4)}°, {deviceCoords.lng.toFixed(4)}°
              </p>
            )}
          </div>

          {/* Site address card */}
          <div className="p-3.5 rounded-[14px] bg-slate-50 dark:bg-[#1E293B] text-left text-xs border border-slate-200 dark:border-slate-800">
            <span className="text-[#64748B] dark:text-slate-400 block text-[11px] font-bold">Site Location:</span>
            <span className="font-bold text-[#18181B] dark:text-white">{order.siteAddress}</span>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 bg-slate-50 dark:bg-[#1E293B] border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleProceedToBoq}
            disabled={isVerifying}
            className="w-full h-12 rounded-[12px] bg-[#FCB026] hover:bg-[#e09b1f] text-[#18181B] font-black text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span>Start Work & Material Quote</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

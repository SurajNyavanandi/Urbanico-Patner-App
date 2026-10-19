import React, { useState, useEffect } from 'react';
import { X, Navigation, Phone, ArrowUpRight, CheckCircle, Compass, Radio } from 'lucide-react';
import { ConsignmentDelivery } from '../../types';
import { api } from '../../services/api';
import { audioHaptics } from '../../services/audioHaptics';

interface GpsNavigationModalProps {
  consignment: ConsignmentDelivery;
  onClose: () => void;
  onArrivedAtSite: (consignment: ConsignmentDelivery) => void;
}

export const GpsNavigationModal: React.FC<GpsNavigationModalProps> = ({
  consignment,
  onClose,
  onArrivedAtSite
}) => {
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [speed, setSpeed] = useState<number>(38);
  const [remainingKm, setRemainingKm] = useState<number>(4.2);
  const [etaMinutes, setEtaMinutes] = useState<number>(8);
  const [hasRealGps, setHasRealGps] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<string>(new Date().toLocaleTimeString());

  // Real Hardware Device GPS via navigator.geolocation.watchPosition
  useEffect(() => {
    let watchId: number | null = null;

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const deviceSpeedKmph = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 38;

          setDeviceCoords({ lat, lng });
          setHasRealGps(true);
          setSpeed(deviceSpeedKmph || 38);

          // Calculate approximate distance to destination
          const destLat = consignment.destinationCoordinates?.lat ?? 17.4401;
          const destLng = consignment.destinationCoordinates?.lng ?? 78.3489;
          const dLat = (lat - destLat) * 111;
          const dLng = (lng - destLng) * 111 * Math.cos(lat * (Math.PI / 180));
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          const roundedKm = Math.max(0.2, Number(dist.toFixed(1)));
          setRemainingKm(roundedKm);
          setEtaMinutes(Math.max(1, Math.round((roundedKm / 40) * 60)));

          // Push real telemetry to server
          api.updateLocationBeacon(consignment.id, lat, lng, deviceSpeedKmph);
          setLastPingTime(new Date().toLocaleTimeString());
        },
        _err => {
          // Fallback if browser permission denied
          setHasRealGps(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [consignment.id, consignment.destinationCoordinates]);

  // Periodic heartbeat beacon
  useEffect(() => {
    const interval = setInterval(async () => {
      audioHaptics.playPing();
      const currentLat = deviceCoords?.lat || consignment.currentLocation?.lat || 17.4401;
      const currentLng = deviceCoords?.lng || consignment.currentLocation?.lng || 78.3489;
      await api.updateLocationBeacon(consignment.id, currentLat, currentLng, speed);
      setLastPingTime(new Date().toLocaleTimeString());
    }, 15000);

    return () => clearInterval(interval);
  }, [consignment.id, deviceCoords, speed]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#0F172A] text-[#18181B] dark:text-white w-full max-w-lg rounded-t-[24px] sm:rounded-[24px] border border-slate-200 dark:border-[#334155] shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Next Turn Direction (Blue Apple Banner) */}
        <div className="bg-[#0284C7] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[12px] bg-white/20 flex items-center justify-center shrink-0">
              <ArrowUpRight size={28} strokeWidth={2.8} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-100">In 450 meters</p>
              <h3 className="text-sm font-black leading-snug">
                Turn right toward Financial District Site
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              audioHaptics.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Real Device Hardware GPS Sensor Indicator */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {hasRealGps ? 'Phone Hardware GPS: Active' : 'Live GPS Location Sharing'}
            </span>
          </div>
          <span className="text-[#64748B] text-[11px] font-mono">
            {deviceCoords ? `${deviceCoords.lat.toFixed(4)}°, ${deviceCoords.lng.toFixed(4)}°` : `Updated ${lastPingTime}`}
          </span>
        </div>

        {/* Road Map Visual */}
        <div className="p-4 bg-slate-100 dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800">
          <div className="relative h-40 w-full bg-white dark:bg-[#0F172A] rounded-[16px] border border-slate-200 dark:border-slate-800 p-3 overflow-hidden shadow-xs">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
              <path
                d="M 25 120 C 120 120, 160 45, 250 45 C 310 45, 340 95, 375 85"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 25 120 C 120 120, 160 45, 250 45 C 310 45, 340 95, 375 85"
                fill="none"
                stroke="#FCB026"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <circle cx="25" cy="120" r="5" fill="#64748B" />
              <text x="25" y="140" fill="#64748B" fontSize="11" fontWeight="bold">Quarry</text>

              <circle cx="375" cy="85" r="6" fill="#10B981" />
              <text x="325" y="105" fill="#10B981" fontSize="11" fontWeight="bold">Site #42</text>
            </svg>

            {/* Truck Beacon Marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: '68%',
                top: '46%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#FCB026] text-[#18181B] flex items-center justify-center font-bold shadow-md border-2 border-white">
                <Navigation size={16} className="transform rotate-45" />
              </div>
              <span className="mt-1 px-1.5 py-0.5 rounded bg-black text-white text-[9px] font-bold">
                {speed} km/h
              </span>
            </div>
          </div>
        </div>

        {/* 3 Clean Numbers */}
        <div className="grid grid-cols-3 gap-2.5 p-4 border-b border-slate-100 dark:border-slate-800 text-center">
          <div className="p-3 rounded-[14px] bg-slate-50 dark:bg-[#1E293B]">
            <span className="text-[11px] font-bold text-[#64748B] block mb-0.5">Speed</span>
            <span className="text-xl font-black">{speed} <span className="text-xs font-normal text-[#64748B]">km/h</span></span>
          </div>

          <div className="p-3 rounded-[14px] bg-[#FFF8EB] dark:bg-amber-950/40 border border-[#FCB026]/40">
            <span className="text-[11px] font-bold text-[#B45309] dark:text-[#FCB026] block mb-0.5">Distance Left</span>
            <span className="text-xl font-black text-[#18181B] dark:text-[#FCB026]">{remainingKm} <span className="text-xs font-normal">km</span></span>
          </div>

          <div className="p-3 rounded-[14px] bg-slate-50 dark:bg-[#1E293B]">
            <span className="text-[11px] font-bold text-[#64748B] block mb-0.5">Time Left</span>
            <span className="text-xl font-black text-[#10B981]">{etaMinutes} <span className="text-xs font-normal text-[#64748B]">mins</span></span>
          </div>
        </div>

        {/* Destination & Supervisor Strip */}
        <div className="px-5 py-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#64748B]">Destination:</span>
            <span className="font-bold truncate max-w-[220px]">Site #42, Financial District</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Site Incharge:</span>
            <span className="font-bold">{consignment.supervisorName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-[#1E293B] border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              audioHaptics.playTap();
              window.location.href = `tel:${consignment.supervisorPhone}`;
            }}
            className="w-full h-12 rounded-[12px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-[#18181B] dark:text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Phone size={16} className="text-[#0284C7]" />
            <span>Call Site Incharge ({consignment.supervisorName})</span>
          </button>

          <button
            onClick={() => {
              audioHaptics.playTap();
              onArrivedAtSite(consignment);
            }}
            className="w-full h-12 rounded-[12px] bg-[#FCB026] hover:bg-[#e09b1f] text-[#18181B] font-black text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle size={18} />
            <span>I Have Reached the Site · Enter 4-Digit Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};

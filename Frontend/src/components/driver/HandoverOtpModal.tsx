import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, PenTool, Camera, RotateCcw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { ConsignmentDelivery } from '../../types';
import { api } from '../../services/api';
import { audioHaptics } from '../../services/audioHaptics';

interface HandoverOtpModalProps {
  consignment: ConsignmentDelivery;
  isOffline?: boolean;
  onClose: () => void;
  onHandoverComplete: (updatedConsignment: ConsignmentDelivery) => void;
}

export const HandoverOtpModal: React.FC<HandoverOtpModalProps> = ({
  consignment,
  isOffline = false,
  onClose,
  onHandoverComplete
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  }, []);

  useEffect(() => {
    if (isVerified && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isVerified]);

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 4).split('');
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      audioHaptics.playTap();
      if (pasted.length === 4) {
        verifyHandover(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);
    setErrorMsg(null);
    audioHaptics.playTap();

    if (cleaned && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 3 && cleaned && newOtp.every(d => d !== '')) {
      verifyHandover(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyHandover = async (codeString?: string) => {
    const finalOtp = codeString || otp.join('');
    if (finalOtp.length !== 4) {
      setErrorMsg('Please enter all 4 numbers');
      audioHaptics.playError();
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    const res = await api.verifyHandoverOtp(consignment.orderNumber, finalOtp);
    setIsVerifying(false);

    if (res.success && res.delivery) {
      audioHaptics.playSuccess();
      setIsVerified(true);
    } else {
      audioHaptics.playError();
      setErrorMsg(res.message || 'Wrong code. Please ask the site incharge for the 4-digit code.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  // Canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    audioHaptics.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  // Real Device Camera & File Capture
  const handleRealCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioHaptics.playTap();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = () => {
    audioHaptics.playSuccess();
    const signatureData = canvasRef.current?.toDataURL();
    const updated: ConsignmentDelivery = {
      ...consignment,
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
      podSignature: signatureData,
      weighbridgePhoto: uploadedPhotoUrl || undefined
    };
    onHandoverComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#1E293B] text-[#18181B] dark:text-white w-full max-w-md rounded-t-[24px] sm:rounded-[24px] border border-slate-200 dark:border-[#334155] shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base">Enter 4-Digit Delivery Code</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{consignment.orderNumber} · {consignment.cargoDescription}</p>
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
        <div className="p-5 overflow-y-auto space-y-4">
          {!isVerified ? (
            <div className="text-center py-2">
              <p className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mb-5">
                Ask site incharge <span className="text-[#18181B] dark:text-white font-extrabold">{consignment.supervisorName}</span> for their 4-digit code.
              </p>

              {/* 4 Large Clean Number Inputs */}
              <div className={`flex justify-center gap-3 my-4 ${isShaking ? 'animate-shake' : ''}`}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className={`w-14 h-18 text-center text-3xl font-black rounded-[16px] border transition-all outline-none ${
                      digit
                        ? 'border-[#FCB026] bg-[#FFF8EB] dark:bg-amber-950/40 text-[#18181B] dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A]'
                    } focus:border-[#FCB026]`}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-[12px] bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-2 mb-4">
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={() => verifyHandover()}
                disabled={isVerifying || otp.some(d => !d)}
                className="w-full h-12 bg-[#FCB026] hover:bg-[#e09b1f] text-[#18181B] font-black text-sm rounded-[12px] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isVerifying ? 'Checking Code...' : 'Confirm Delivery Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Green Verified Banner */}
              <div className="p-4 rounded-[16px] bg-emerald-50 dark:bg-emerald-950/40 border border-[#10B981]/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#10B981]">Delivery Code Verified!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Material handover confirmed.</p>
                </div>
              </div>

              {/* Real Supervisor Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <PenTool size={14} className="text-[#FCB026]" />
                    <span>Supervisor Signature</span>
                  </label>
                  {hasSignature && (
                    <button
                      onClick={clearSignature}
                      className="text-xs text-[#64748B] hover:text-red-500 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Erase</span>
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-[14px] bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={360}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 touch-none cursor-crosshair"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                      Sign here with your finger
                    </div>
                  )}
                </div>
              </div>

              {/* Real Device Camera Capture for Delivery Proof */}
              <div>
                <label className="text-xs font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mb-1.5">
                  <Camera size={14} className="text-[#0284C7]" />
                  <span>Real Photo of Unloaded Material (Camera)</span>
                </label>

                {/* Hidden native camera file input */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleRealCameraCapture}
                  className="hidden"
                />

                {uploadedPhotoUrl ? (
                  <div className="relative rounded-[14px] overflow-hidden border border-slate-200 dark:border-slate-700 h-32">
                    <img src={uploadedPhotoUrl} alt="Captured Delivery Proof" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setUploadedPhotoUrl(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-[14px] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FCB026] flex flex-col items-center justify-center gap-1.5 text-[#64748B] text-xs font-semibold cursor-pointer transition-colors bg-slate-50 dark:bg-[#0F172A]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center">
                      <Camera size={20} />
                    </div>
                    <span>Tap to Open Phone Camera & Take Real Photo</span>
                  </button>
                )}
              </div>

              {/* Complete Delivery Button */}
              <button
                onClick={handleFinalSubmit}
                className="w-full h-12 rounded-[12px] bg-[#10B981] hover:bg-[#0da06f] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CheckCircle size={18} />
                <span>Complete Delivery & Release Truck</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

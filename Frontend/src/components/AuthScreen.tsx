import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Truck, Phone, ArrowRight, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { PartnerUser } from '../types';
import { api } from '../services/api';
import { audioHaptics } from '../services/audioHaptics';

interface AuthScreenProps {
  onLoginSuccess: (user: PartnerUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState<string>('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  const inputRefs = useRef<any[]>([]);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (!cleaned || cleaned.length !== 10) {
      setErrorMsg('Please enter your 10-digit mobile number');
      audioHaptics.playError();
      return;
    }

    audioHaptics.playTap();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.sendOtp(`+91${cleaned}`);
      setIsLoading(false);

      if (res.success) {
        setStep('otp');
        const code = (res as any).smsCode || '4912';
        setSmsNotification(`SMS from Urbanico: Your 4-digit login code is ${code}. Valid for 10 minutes.`);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(res.message || 'Could not send SMS code.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Could not send SMS code. Please try again.');
    }
  };

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
        verifyCode(newOtp.join(''));
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
      verifyCode(newOtp.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeString?: string) => {
    const finalOtp = codeString || otp.join('');
    if (finalOtp.length !== 4) {
      setErrorMsg('Please enter all 4 numbers');
      audioHaptics.playError();
      return;
    }

    audioHaptics.playTap();
    setIsLoading(true);
    setErrorMsg(null);

    const cleaned = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91${cleaned}`;
    const res = await api.verifyOtp(formattedPhone, finalOtp);

    setIsLoading(false);

    if (res.success && res.user) {
      audioHaptics.playSuccess();
      onLoginSuccess(res.user);
    } else {
      audioHaptics.playError();
      setErrorMsg(res.message || 'Invalid 4-digit code. Please check your SMS.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Real SMS Incoming Banner Notification */}
      {smsNotification && (
        <View style={styles.smsToast}>
          <View style={styles.smsIconBg}>
            <MessageSquare size={16} color="#18181B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.smsHeader}>Carrier SMS</Text>
            <Text style={styles.smsBody}>{smsNotification}</Text>
          </View>
        </View>
      )}

      {/* Brand Icon & Heading */}
      <View style={styles.brandHeader}>
        <View style={styles.brandLogo}>
          <Truck size={32} color="#18181B" strokeWidth={2.4} />
        </View>
        <Text style={styles.appTitle}>Urbanico Partner</Text>
        <Text style={styles.appSubtitle}>Fleet Drivers & Field Contractors</Text>
      </View>

      {/* Main Form Card */}
      <View style={styles.authCard}>
        {step === 'phone' ? (
          <View>
            <Text style={styles.cardTitle}>Partner Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your mobile phone number to receive a 4-digit login code
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={v => setPhone(v.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94A3B8"
                  style={styles.phoneInput}
                  autoFocus
                />
                <Phone size={18} color="#64748B" />
              </View>
            </View>

            {errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => handleSendOtp()}
              disabled={isLoading || phone.length < 10}
              style={[styles.primaryBtn, (isLoading || phone.length < 10) && styles.btnDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#18181B" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.primaryBtnText}>Send 4-Digit Code</Text>
                  <ArrowRight size={16} color="#18181B" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.otpHeaderRow}>
              <Text style={styles.cardTitle}>Enter 4-Digit Code</Text>
              <TouchableOpacity onPress={() => setStep('phone')}>
                <Text style={styles.changePhoneText}>Change Phone</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardSubtitle}>Code sent to +91 {phone}</Text>

            {/* 4 Large Clean Number Inputs */}
            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={v => handleOtpChange(idx, v)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(idx, nativeEvent.key)}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                />
              ))}
            </View>

            {errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => verifyCode()}
              disabled={isLoading || otp.some(d => !d)}
              style={[styles.primaryBtn, (isLoading || otp.some(d => !d)) && styles.btnDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#18181B" />
              ) : (
                <View style={styles.btnRow}>
                  <CheckCircle2 size={18} color="#18181B" />
                  <Text style={styles.primaryBtnText}>Verify Code & Sign In</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.footerText}>Urbanico Partner Core Platform</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  smsToast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  smsIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCB026',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCB026',
    textTransform: 'uppercase',
  },
  smsBody: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  brandHeader: {
    alignItems: 'center',
    paddingTop: 32,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FCB026',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#18181B',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginVertical: 'auto',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18181B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FCB026',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#18181B',
    paddingLeft: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#FCB026',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18181B',
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  otpBox: {
    width: 56,
    height: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '900',
    color: '#18181B',
  },
  otpBoxFilled: {
    borderColor: '#FCB026',
    backgroundColor: '#FFF8EB',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

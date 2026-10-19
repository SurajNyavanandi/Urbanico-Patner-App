import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Phone, CheckCircle, Scale, Navigation } from 'lucide-react';
import { ConsignmentDelivery } from '../../types';
import { audioHaptics } from '../../services/audioHaptics';

interface ConsignmentCardProps {
  consignment: ConsignmentDelivery;
  isNightMode?: boolean;
  onOpenGps: (consignment: ConsignmentDelivery) => void;
  onOpenSlip: (consignment: ConsignmentDelivery) => void;
  onVerifyOtp: (consignment: ConsignmentDelivery) => void;
}

export const ConsignmentCard: React.FC<ConsignmentCardProps> = ({
  consignment,
  isNightMode = false,
  onOpenGps,
  onOpenSlip,
  onVerifyOtp
}) => {
  const isDelivered = consignment.status === 'delivered';
  const isInTransit = consignment.status === 'in_transit';

  const handleCall = () => {
    audioHaptics.playTap();
    window.location.href = `tel:${consignment.supervisorPhone}`;
  };

  const colors = {
    card: isNightMode ? '#1E293B' : '#FFFFFF',
    text: isNightMode ? '#F8FAFC' : '#18181B',
    subtext: isNightMode ? '#94A3B8' : '#64748B',
    border: isNightMode ? '#334155' : '#E2E8F0',
    innerBg: isNightMode ? '#0F172A' : '#F8FAFC',
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, isInTransit && styles.activeCard]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.row}>
          <Text style={[styles.orderNo, { color: colors.text }]}>{consignment.orderNumber}</Text>
          <Text style={[styles.tonnageText, { color: colors.subtext }]}> · {consignment.tonnage} Tons</Text>
        </View>

        <View style={[styles.statusBadge, isDelivered ? styles.statusDelivered : isInTransit ? styles.statusTransit : styles.statusAssigned]}>
          <Text style={[styles.statusText, isDelivered ? styles.textDelivered : isInTransit ? styles.textTransit : styles.textAssigned]}>
            {isDelivered ? 'Delivered' : isInTransit ? 'On the Way' : 'Assigned'}
          </Text>
        </View>
      </View>

      {/* Cargo Title */}
      <Text style={[styles.cargoTitle, { color: colors.text }]}>
        {consignment.cargoDescription}
      </Text>

      {/* Pickup & Destination */}
      <View style={styles.locationGroup}>
        <View style={styles.row}>
          <View style={styles.pickupBadge}>
            <Text style={styles.pickupBadgeText}>PICKUP</Text>
          </View>
          <Text style={[styles.locationText, { color: colors.subtext }]} numberOfLines={1}>
            {consignment.pickupSource}
          </Text>
        </View>

        <View style={styles.row}>
          <MapPin size={16} color="#FCB026" />
          <Text style={[styles.locationTextBold, { color: colors.text }]} numberOfLines={2}>
            {consignment.destinationAddress}
          </Text>
        </View>
      </View>

      {/* Supervisor Strip */}
      <View style={[styles.supervisorStrip, { backgroundColor: colors.innerBg }]}>
        <Text style={[styles.supervisorText, { color: colors.subtext }]}>
          Site Incharge: <Text style={{ color: colors.text, fontWeight: '700' }}>{consignment.supervisorName}</Text>
        </Text>
        <Text style={styles.phoneText}>{consignment.supervisorPhone}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.innerBg, borderColor: colors.border }]} onPress={handleCall}>
          <Phone size={15} color="#0284C7" />
          <Text style={[styles.btnText, { color: colors.text }]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.innerBg, borderColor: colors.border }]} onPress={() => { audioHaptics.playTap(); onOpenSlip(consignment); }}>
          <Scale size={14} color="#64748B" />
          <Text style={[styles.btnText, { color: colors.text }]}>Slip</Text>
        </TouchableOpacity>

        {!isDelivered ? (
          <>
            <TouchableOpacity style={styles.mapBtn} onPress={() => { audioHaptics.playTap(); onOpenGps(consignment); }}>
              <Navigation size={14} color="#FFFFFF" />
              <Text style={styles.mapBtnText}>Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => { audioHaptics.playTap(); onVerifyOtp(consignment); }}>
              <CheckCircle size={15} color="#18181B" />
              <Text style={styles.primaryBtnText}>4-Digit Code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.deliveredBox}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.deliveredText}>Delivered</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  activeCard: {
    borderColor: '#FCB026',
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderNo: {
    fontSize: 15,
    fontWeight: '900',
  },
  tonnageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTransit: {
    backgroundColor: '#FFF8EB',
    borderColor: '#FCB026',
    borderWidth: 1,
  },
  statusDelivered: {
    backgroundColor: '#ECFDF5',
  },
  statusAssigned: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textTransit: {
    color: '#B45309',
  },
  textDelivered: {
    color: '#10B981',
  },
  textAssigned: {
    color: '#64748B',
  },
  cargoTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  locationGroup: {
    gap: 8,
    marginBottom: 12,
  },
  pickupBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pickupBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  locationTextBold: {
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  supervisorStrip: {
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  supervisorText: {
    fontSize: 12,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapBtn: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FCB026',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#18181B',
  },
  deliveredBox: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deliveredText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#10B981',
  },
});

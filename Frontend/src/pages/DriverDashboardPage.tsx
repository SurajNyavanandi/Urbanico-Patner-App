import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Truck, Navigation, CheckCircle, Plus, X, Package } from 'lucide-react';
import { ConsignmentDelivery, PartnerUser } from '../types';
import { api } from '../services/api';
import { ConsignmentCard } from '../components/driver/ConsignmentCard';
import { WeighbridgeSlipModal } from '../components/driver/WeighbridgeSlipModal';
import { GpsNavigationModal } from '../components/driver/GpsNavigationModal';
import { HandoverOtpModal } from '../components/driver/HandoverOtpModal';
import { useHaptics } from '../hooks/useHaptics';

interface DriverDashboardPageProps {
  user: PartnerUser;
  isNightMode?: boolean;
  isOffline?: boolean;
}

export const DriverDashboardPage: React.FC<DriverDashboardPageProps> = ({
  user,
  isNightMode = false,
  isOffline = false
}) => {
  const { playTap, playSuccess } = useHaptics();
  const [consignments, setConsignments] = useState<ConsignmentDelivery[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'in_transit' | 'delivered'>('all');
  const [selectedSlip, setSelectedSlip] = useState<ConsignmentDelivery | null>(null);
  const [selectedGps, setSelectedGps] = useState<ConsignmentDelivery | null>(null);
  const [selectedOtp, setSelectedOtp] = useState<ConsignmentDelivery | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [newCargo, setNewCargo] = useState('12 Tons • 20mm Granite Stones');
  const [newTonnage, setNewTonnage] = useState('12');
  const [newDestination, setNewDestination] = useState('Tower 5, Gachibowli Financial Hub, Hyderabad');
  const [newSupervisor, setNewSupervisor] = useState('Suresh Rao');
  const [newPhone, setNewPhone] = useState('9849123456');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const loadDeliveries = async () => {
    const list = await api.getAssignedDeliveries();
    setConsignments(list);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleHandoverSuccess = (updated: ConsignmentDelivery) => {
    setSelectedOtp(null);
    setConsignments(prev => prev.map(item => (item.id === updated.id ? updated : item)));
    setToastMessage(`Delivery ${updated.orderNumber} is complete!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateDelivery = async () => {
    if (!newCargo || !newDestination || !newPhone) return;

    playTap();
    setIsSubmittingNew(true);

    const res = await api.createDelivery({
      cargoDescription: newCargo,
      tonnage: Number(newTonnage) || 10,
      destinationAddress: newDestination,
      supervisorName: newSupervisor,
      supervisorPhone: `+91${newPhone.replace(/\D/g, '').slice(-10)}`,
      vehicleNumber: user.activeVehicle ? user.activeVehicle.split(' ')[0] : 'TS-07-UB-4491'
    });

    setIsSubmittingNew(false);

    if (res.success && res.delivery) {
      playSuccess();
      setConsignments(prev => [res.delivery!, ...prev]);
      setShowAddModal(false);
      setToastMessage(`New delivery ${res.delivery.orderNumber} added! Handover code is ${res.delivery.handoverOtp}.`);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const activeShipment = consignments.find(c => c.status === 'in_transit');
  const deliveredTonnage = consignments.reduce((sum, c) => sum + (c.status === 'delivered' ? c.tonnage : 0), 0);
  const deliveredCount = consignments.filter(c => c.status === 'delivered').length;

  const filtered = consignments.filter(c => {
    if (activeTab === 'in_transit') return c.status === 'in_transit' || c.status === 'assigned';
    if (activeTab === 'delivered') return c.status === 'delivered';
    return true;
  });

  const colors = {
    card: isNightMode ? '#1E293B' : '#FFFFFF',
    text: isNightMode ? '#F8FAFC' : '#18181B',
    subtext: isNightMode ? '#94A3B8' : '#64748B',
    border: isNightMode ? '#334155' : '#E2E8F0',
    innerBg: isNightMode ? '#0F172A' : '#F8FAFC',
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {toastMessage && (
        <View style={styles.toastBox}>
          <CheckCircle size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.truckIconBg}>
            <Truck size={22} color="#18181B" />
          </View>
          <View>
            <Text style={[styles.vehicleNumber, { color: colors.text }]}>{user.activeVehicle || 'TS-07-UB-4491'}</Text>
            <Text style={[styles.driverName, { color: colors.subtext }]}>
              Driver: {user.name} · {consignments.length} Active Loads
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.row}>
            <View style={styles.pulseDot} />
            <Text style={styles.gpsText}>GPS Active</Text>
          </View>
          <Text style={[styles.sharingText, { color: colors.subtext }]}>Live location sharing</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.subtext }]}>Delivered Today</Text>
          <Text style={styles.amberMetricVal}>{deliveredTonnage} <Text style={styles.unitText}>Tons</Text></Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.subtext }]}>Total Loads</Text>
          <Text style={[styles.metricVal, { color: colors.text }]}>{consignments.length}</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.subtext }]}>Completed</Text>
          <Text style={styles.greenMetricVal}>{deliveredCount}</Text>
        </View>
      </View>

      {activeShipment && (
        <View style={styles.activeBanner}>
          <View style={styles.activeHeader}>
            <View style={styles.row}>
              <View style={styles.amberPulse} />
              <Text style={styles.activeBannerTag}>Trip in Progress</Text>
            </View>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>{activeShipment.orderNumber}</Text>
            </View>
          </View>

          <Text style={styles.activeCargo}>{activeShipment.cargoDescription}</Text>
          <Text style={styles.activeDest} numberOfLines={1}>To: {activeShipment.destinationAddress}</Text>

          <View style={styles.activeActions}>
            <TouchableOpacity 
              style={styles.mapBtn} 
              onPress={() => { playTap(); setSelectedGps(activeShipment); }}
            >
              <Navigation size={15} color="#FFFFFF" />
              <Text style={styles.mapBtnText}>Open Map</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.codeBtn} 
              onPress={() => { playTap(); setSelectedOtp(activeShipment); }}
            >
              <CheckCircle size={15} color="#18181B" />
              <Text style={styles.codeBtnText}>4-Digit Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Deliveries</Text>

        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.newBtn} 
            onPress={() => { playTap(); setShowAddModal(true); }}
          >
            <Plus size={14} color="#18181B" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>

          <View style={[styles.tabBar, { backgroundColor: isNightMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.tabActive]} 
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All ({consignments.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'in_transit' && styles.tabActive]} 
              onPress={() => setActiveTab('in_transit')}
            >
              <Text style={[styles.tabText, activeTab === 'in_transit' && styles.tabTextActive]}>Transit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'delivered' && styles.tabActive]} 
              onPress={() => setActiveTab('delivered')}
            >
              <Text style={[styles.tabText, activeTab === 'delivered' && styles.tabTextActive]}>Done ({deliveredCount})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        {filtered.map(item => (
          <ConsignmentCard
            key={item.id}
            consignment={item}
            isNightMode={isNightMode}
            onOpenGps={c => setSelectedGps(c)}
            onOpenSlip={c => setSelectedSlip(c)}
            onVerifyOtp={c => setSelectedOtp(c)}
          />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No deliveries in this section.</Text>
          </View>
        )}
      </View>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.row}>
                <Package size={18} color="#FCB026" />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Dispatch New Delivery</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Cargo Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.innerBg, borderColor: colors.border, color: colors.text }]}
                value={newCargo}
                onChangeText={setNewCargo}
              />

              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Weight (Tons)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.innerBg, borderColor: colors.border, color: colors.text }]}
                    keyboardType="numeric"
                    value={newTonnage}
                    onChangeText={setNewTonnage}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Vehicle</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.innerBg, borderColor: colors.border, color: colors.subtext }]}
                    editable={false}
                    value={user.activeVehicle ? user.activeVehicle.split(' ')[0] : 'TS-07-UB-4491'}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Delivery Site Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.innerBg, borderColor: colors.border, color: colors.text }]}
                value={newDestination}
                onChangeText={setNewDestination}
              />

              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Site Incharge</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.innerBg, borderColor: colors.border, color: colors.text }]}
                    value={newSupervisor}
                    onChangeText={setNewSupervisor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.subtext }]}>Incharge Mobile</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.innerBg, borderColor: colors.border, color: colors.text }]}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={newPhone}
                    onChangeText={setNewPhone}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.dispatchBtn} 
                onPress={handleCreateDelivery}
                disabled={isSubmittingNew}
              >
                {isSubmittingNew ? (
                  <ActivityIndicator color="#18181B" />
                ) : (
                  <Text style={styles.dispatchBtnText}>Dispatch Delivery</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {selectedSlip && (
        <WeighbridgeSlipModal
          consignment={selectedSlip}
          onClose={() => setSelectedSlip(null)}
        />
      )}

      {selectedGps && (
        <GpsNavigationModal
          consignment={selectedGps}
          onClose={() => setSelectedGps(null)}
          onArrivedAtSite={c => {
            setSelectedGps(null);
            setSelectedOtp(c);
          }}
        />
      )}

      {selectedOtp && (
        <HandoverOtpModal
          consignment={selectedOtp}
          isOffline={isOffline}
          onClose={() => setSelectedOtp(null)}
          onHandoverComplete={handleHandoverSuccess}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  toastBox: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  infoCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  truckIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FCB026',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  driverName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  gpsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  sharingText: {
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  amberMetricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FCB026',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  greenMetricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(252,176,38,0.4)',
    marginBottom: 14,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amberPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCB026',
    marginRight: 6,
  },
  activeBannerTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCB026',
    textTransform: 'uppercase',
  },
  orderBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  activeCargo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activeDest: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 12,
  },
  activeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  mapBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  codeBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FCB026',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  codeBtnText: {
    color: '#18181B',
    fontSize: 12.5,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  newBtn: {
    backgroundColor: '#FCB026',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  newBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#18181B',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FCB026',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#18181B',
    fontWeight: '800',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  dispatchBtn: {
    height: 48,
    backgroundColor: '#FCB026',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  dispatchBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#18181B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

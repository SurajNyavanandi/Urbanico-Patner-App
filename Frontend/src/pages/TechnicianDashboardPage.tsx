import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { HardHat, CheckCircle2 } from 'lucide-react';
import { ServiceOrder, PartnerUser } from '../types';
import { api } from '../services/api';
import { ServiceVisitCard } from '../components/technician/ServiceVisitCard';
import { GpsCheckInModal } from '../components/technician/GpsCheckInModal';
import { PostVisitBoqModal } from '../components/technician/PostVisitBoqModal';

interface TechnicianDashboardPageProps {
  user: PartnerUser;
  isNightMode?: boolean;
  isOffline?: boolean;
}

export const TechnicianDashboardPage: React.FC<TechnicianDashboardPageProps> = ({
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
    setSelectedBoq(updated);
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

  const colors = {
    card: isNightMode ? '#1E293B' : '#FFFFFF',
    text: isNightMode ? '#F8FAFC' : '#18181B',
    subtext: isNightMode ? '#94A3B8' : '#64748B',
    border: isNightMode ? '#334155' : '#E2E8F0',
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {toastMessage && (
        <View style={styles.toastBox}>
          <CheckCircle2 size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.hatIconBg}>
            <HardHat size={22} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.contractorName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.tradeText, { color: colors.subtext }]}>
              {user.tradeSpecialty || 'Concrete & Structural Masonry'}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.ratingText}>4.9 ★</Text>
          <Text style={[styles.jobsText, { color: colors.subtext }]}>142 Jobs</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.subtext }]}>Today's Visits</Text>
          <Text style={styles.blueMetricVal}>{services.length}</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.subtext }]}>Visit Fee</Text>
          <Text style={styles.greenMetricVal}>₹99</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metricLabel, { color: colors.subtext }]}>Quotes Sent</Text>
          <Text style={styles.amberMetricVal}>{quotesCount}</Text>
        </View>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>How Site Visits Work:</Text>
        <Text style={styles.instructionBody}>
          The customer booked a ₹99 inspection. When you reach their site, measure the area and create a quote for workers, machines, and materials so the customer can approve it.
        </Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Site Visits</Text>
        <View style={[styles.tabBar, { backgroundColor: isNightMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.tabActive]} 
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All ({services.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pending_checkin' && styles.tabActive]} 
            onPress={() => setActiveTab('pending_checkin')}
          >
            <Text style={[styles.tabText, activeTab === 'pending_checkin' && styles.tabTextActive]}>Need Visit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'quoted' && styles.tabActive]} 
            onPress={() => setActiveTab('quoted')}
          >
            <Text style={[styles.tabText, activeTab === 'quoted' && styles.tabTextActive]}>Quoted ({quotesCount})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
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
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No visits in this section.</Text>
          </View>
        )}
      </View>

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
  hatIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractorName: {
    fontSize: 16,
    fontWeight: '900',
  },
  tradeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCB026',
  },
  jobsText: {
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
  blueMetricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0284C7',
  },
  greenMetricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  amberMetricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FCB026',
  },
  instructionCard: {
    backgroundColor: '#FFF8EB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252,176,38,0.4)',
    padding: 14,
    marginBottom: 14,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
    marginBottom: 4,
  },
  instructionBody: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

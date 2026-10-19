import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Truck, HardHat, WifiOff, RefreshCw, Moon, Sun, LogOut } from 'lucide-react';
import { PartnerUser, PartnerRole } from '../../types';
import { useHaptics } from '../../hooks/useHaptics';

interface HeaderProps {
  user: PartnerUser | null;
  currentRole: PartnerRole;
  onSwitchRole: (role: PartnerRole) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onLogout: () => void;
  offlineCount?: number;
  onSyncOffline?: () => void;
  syncMessage?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentRole,
  onSwitchRole,
  isOffline,
  onToggleOffline,
  isNightMode,
  onToggleNightMode,
  onLogout,
  offlineCount = 0,
  onSyncOffline,
  syncMessage
}) => {
  const { playTap } = useHaptics();

  const colors = {
    bg: isNightMode ? '#0F172A' : '#FFFFFF',
    text: isNightMode ? '#F8FAFC' : '#18181B',
    subtext: isNightMode ? '#94A3B8' : '#64748B',
    border: isNightMode ? '#334155' : '#E2E8F0',
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <View style={styles.row}>
            <WifiOff size={14} color="#18181B" />
            <Text style={styles.offlineBannerText}>Offline Mode · Handovers save locally</Text>
          </View>
          <TouchableOpacity onPress={onToggleOffline}>
            <Text style={styles.offlineReconnectText}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {syncMessage && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>{syncMessage}</Text>
        </View>
      )}

      <View style={styles.mainBar}>
        <View style={styles.brandGroup}>
          <View style={styles.brandLogo}>
            {currentRole === 'driver' ? (
              <Truck size={20} color="#18181B" strokeWidth={2.5} />
            ) : (
              <HardHat size={20} color="#18181B" strokeWidth={2.5} />
            )}
          </View>
          <View>
            <View style={styles.row}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>Urbanico</Text>
              <View style={styles.partnerBadge}>
                <Text style={styles.partnerBadgeText}>PARTNER</Text>
              </View>
            </View>
            <Text style={[styles.userName, { color: colors.subtext }]}>
              {user?.name || 'Partner'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          {offlineCount > 0 && onSyncOffline && (
            <TouchableOpacity style={styles.syncBadge} onPress={onSyncOffline}>
              <RefreshCw size={12} color="#18181B" />
              <Text style={styles.syncBadgeText}>{offlineCount} Sync</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.roleSwitcher, { backgroundColor: isNightMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.roleBtn, currentRole === 'driver' && styles.roleBtnActive]}
              onPress={() => {
                playTap();
                onSwitchRole('driver');
              }}
            >
              <Truck size={13} color={currentRole === 'driver' ? '#18181B' : colors.subtext} />
              <Text style={[styles.roleText, currentRole === 'driver' && styles.roleTextActive]}>Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, currentRole === 'trade_partner' && styles.roleBtnActive]}
              onPress={() => {
                playTap();
                onSwitchRole('trade_partner');
              }}
            >
              <HardHat size={13} color={currentRole === 'trade_partner' ? '#18181B' : colors.subtext} />
              <Text style={[styles.roleText, currentRole === 'trade_partner' && styles.roleTextActive]}>Worker</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isNightMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => {
              playTap();
              onToggleNightMode();
            }}
          >
            {isNightMode ? <Sun size={16} color="#FCB026" /> : <Moon size={16} color="#18181B" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isNightMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => {
              playTap();
              onLogout();
            }}
          >
            <LogOut size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 1,
  },
  offlineBanner: {
    backgroundColor: '#FCB026',
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offlineBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18181B',
    marginLeft: 6,
  },
  offlineReconnectText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#18181B',
    textDecorationLine: 'underline',
  },
  syncBanner: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    alignItems: 'center',
  },
  syncBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  mainBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FCB026',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  partnerBadge: {
    backgroundColor: '#FFF8EB',
    borderColor: '#FCB026',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  partnerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  userName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncBadge: {
    backgroundColor: '#FCB026',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18181B',
  },
  roleSwitcher: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBtnActive: {
    backgroundColor: '#FCB026',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTextActive: {
    color: '#18181B',
    fontWeight: '800',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

import { useState, useEffect } from 'react';
import { PartnerUser, PartnerRole } from '../types';
import { api } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<PartnerUser | null>(() => api.getCurrentUser());
  const [currentRole, setCurrentRole] = useState<PartnerRole>(user?.role || 'driver');

  useEffect(() => {
    if (user) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const switchRole = (role: PartnerRole) => {
    setCurrentRole(role);
    let newUser: PartnerUser;
    if (role === 'driver') {
      newUser = {
        phone: '+919876543210',
        name: 'Raju Yadav',
        role: 'driver',
        fleetBadge: 'TS-07-UB-4491 · Tier 1 Heavy Carrier',
        activeVehicle: 'TS-07-UB-4491 (BharatBenz 2823R)',
        rating: 4.92,
        completedTrips: 384
      };
    } else {
      newUser = {
        phone: '+919123456789',
        name: 'Satish Reddy',
        role: 'trade_partner',
        fleetBadge: 'Gold Grade Contractor #9182',
        tradeSpecialty: 'Concrete Slab Casting & Structural Masonry',
        rating: 4.92,
        completedTrips: 142
      };
    }
    setUser(newUser);
    api.saveCurrentUser(newUser);
  };

  const loginSuccess = (newUser: PartnerUser) => {
    setUser(newUser);
    setCurrentRole(newUser.role);
  };

  const logout = () => {
    setUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('urbanico_partner_current_user');
    }
  };

  return {
    user,
    currentRole,
    switchRole,
    loginSuccess,
    logout
  };
}

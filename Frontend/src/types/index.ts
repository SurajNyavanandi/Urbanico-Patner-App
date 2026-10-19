export type PartnerRole = 'driver' | 'trade_partner';

export interface PartnerUser {
  phone: string;
  name: string;
  role: PartnerRole;
  fleetBadge?: string;
  activeVehicle?: string;
  tradeSpecialty?: string;
  rating: number;
  completedTrips: number;
}

export type DeliveryStatus = 'assigned' | 'in_transit' | 'arrived' | 'delivered';

export interface ConsignmentDelivery {
  id: string;
  orderNumber: string;
  cargoDescription: string;
  tonnage: number;
  quarryOrigin: string;
  pickupSource?: string;
  destinationAddress: string;
  destinationCoordinates?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  supervisorName: string;
  supervisorPhone: string;
  handoverOtp: string;
  grossWeight: number;
  grossWeightKg?: number;
  tareWeight: number;
  tareWeightKg?: number;
  netPayload: number;
  netWeightKg?: number;
  ewayBillNo: string;
  eWayBillNo?: string;
  quarryGatePass?: string;
  vehicleNumber?: string;
  status: DeliveryStatus;
  dispatchedAt: string;
  deliveredAt?: string;
  podSignature?: string;
  weighbridgePhoto?: string;
}

export type ServiceOrderStatus = 'scheduled' | 'technician_en_route' | 'arrived_on_site' | 'quote_submitted' | 'customer_approved';

export interface BOQMaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
}

export interface ServiceOrder {
  id: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  siteCoordinates?: { lat: number; lng: number };
  scheduledTimeSlot: string;
  baseBookingFee: number;
  status: ServiceOrderStatus;
  revisedAreaSqFt?: number;
  revisedMaterialEstimate?: number;
  revisedLaborEstimate?: number;
  machineryRental?: number;
  materialsList?: BOQMaterialItem[];
  materialRequisitions?: any[];
  measurements?: { lengthFt?: number; widthFt?: number; heightFt?: number; areaSqFt?: number; volumeCuFt?: number; runningMeters?: number; unitDescription?: string };
  crewComposition?: { masons?: number; helpers?: number; electricians?: number; daysEstimate?: number };
  machineryRequirements?: any[];
  inspectionNotes?: string;
  gstAmount?: number;
  totalPayable?: number;
  customerConfirmationRequested?: boolean;
  technicianNotes?: string;
  checkedInAt?: string;
}

export interface OfflineSyncItem {
  id: string;
  type: 'delivery_handover' | 'gps_ping' | 'visit_quote';
  payload: any;
  createdAt: string;
  retryCount: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  hash: string;
  details: string;
}

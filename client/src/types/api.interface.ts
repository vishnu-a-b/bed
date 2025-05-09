interface Role {
  _id: string;
  title: string;
  slug: string;
  __v: number;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  isSuperAdmin: boolean;
  roles: Role[];
  id: string;
}

export interface RoleOption {
  value: string;
  label: string;
  slug: string;
}
export interface LeaveDetail  {
  _id: string;
  name: string;
  date: string;
  department: string;
  remark: string;
  reason: string;
  status: string;
  createdAt: string; 
};


export interface Stay {
  stayTime: number; // in minutes
  travalTime?: string;
  address: [number,number];
  stayStartTime: string;
  stayEndTime: string;
  stayBeforeDistance?: number; // in kilometers
}

export interface TravelData {
  totalDistance: number; // in kilometers
  stay: Stay[];
  firstLocation: [number, number];
  firstTime?: string;
  lastLocation: [number, number];
  lastDistance?: number; // in kilometers
  lastTime?: string;
}
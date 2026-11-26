export interface UserAddressItem {
  id: number;
  user_id: number;
  recipient_id: number | null;
  address_name: string | null;
  detail_address: string;
  ward: string | null;
  district: string | null;
  province: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export type CreateUserAddressPayload = Omit<UserAddressItem, 'id'>;
export type UpdateUserAddressPayload = Partial<Omit<UserAddressItem, 'id' | 'user_id'>>;
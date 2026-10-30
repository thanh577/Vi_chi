// Vi Chi - Render biểu tượng danh mục thành icon thật thay vì hiển thị tên khóa

import {
  Briefcase, Car, Clock, FileText, Gamepad2, Gift, GraduationCap, HeartPulse,
  Home, MoreHorizontal, Plane, PlusCircle, ShoppingBag, Store, Tag, TrendingUp,
  Users, Utensils, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LoaiBieuTuong {
  key: string;
  ten: string;
  Icon: LucideIcon;
}

export const DANH_SACH_BIEU_TUONG: LoaiBieuTuong[] = [
  { key: 'utensils', ten: 'Ăn uống', Icon: Utensils },
  { key: 'car', ten: 'Đi lại', Icon: Car },
  { key: 'home', ten: 'Nhà ở', Icon: Home },
  { key: 'zap', ten: 'Điện nước', Icon: Zap },
  { key: 'shopping-bag', ten: 'Mua sắm', Icon: ShoppingBag },
  { key: 'heart-pulse', ten: 'Sức khỏe', Icon: HeartPulse },
  { key: 'graduation-cap', ten: 'Giáo dục', Icon: GraduationCap },
  { key: 'gamepad2', ten: 'Giải trí', Icon: Gamepad2 },
  { key: 'file-text', ten: 'Hóa đơn', Icon: FileText },
  { key: 'users', ten: 'Gia đình', Icon: Users },
  { key: 'plane', ten: 'Du lịch', Icon: Plane },
  { key: 'more-horizontal', ten: 'Khác', Icon: MoreHorizontal },
  { key: 'briefcase', ten: 'Lương', Icon: Briefcase },
  { key: 'gift', ten: 'Thưởng', Icon: Gift },
  { key: 'clock', ten: 'Làm thêm', Icon: Clock },
  { key: 'store', ten: 'Kinh doanh', Icon: Store },
  { key: 'trending-up', ten: 'Đầu tư', Icon: TrendingUp },
  { key: 'plus-circle', ten: 'Thu nhập khác', Icon: PlusCircle },
];

const BIEU_TUONG_THEO_KEY: Record<string, LucideIcon> = Object.fromEntries(
  DANH_SACH_BIEU_TUONG.map(({ key, Icon }) => [key, Icon] as const),
);

interface BieuTuongDanhMucProps {
  bieuTuong: string;
  size?: number;
}

export function BieuTuongDanhMuc({ bieuTuong, size = 16 }: BieuTuongDanhMucProps) {
  const Icon = BIEU_TUONG_THEO_KEY[bieuTuong] ?? Tag;
  return <Icon size={size} aria-hidden="true" focusable="false" />;
}

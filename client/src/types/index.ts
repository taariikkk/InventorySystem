// 1. Autentifikacija
export interface AuthResponse {
  username: string;
  email: string;
  token: string;
  role: 'Admin' | 'Manager' | 'Worker';
}

// 2. Proizvodi
export interface ProductResponse {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity: number;
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity: number;
}

// 3. Paginacija
export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// 4. Narudžbe
export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  totalAmount: number;
  items: OrderItemResponse[];
}

// 5. Dashboard / Analitika
export interface TopProductResponse {
  productName: string;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
}

export interface MonthlyRevenueResponse {
  month: string;
  revenue: number;
}

export interface DashboardSummaryResponse {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  topProducts: TopProductResponse[];
  monthlyRevenue: MonthlyRevenueResponse[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    role: 'Admin' | 'Manager' | 'Worker';
}

// 6. Upravljanje korisnicima (Admin-only)
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Worker';
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: number; // 0 = Admin, 1 = Manager, 2 = Worker
}
export interface I_Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface I_OrderItem {
  id: number;
  quantity: number;
  price: number;
  productid: number;
  product: I_Product;
  orderheaderid: number;
  orderheader: string;
}

export interface I_Order {
  id: number;
  status: number;
  customer: number;
  total: number;
  lineitems: I_OrderItem[];
}

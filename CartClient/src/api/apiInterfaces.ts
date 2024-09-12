export interface I_PostOrder {
  quantity: number;
  productid: number;
  userid: number;
}

export interface I_Id {
  id: number;
}

export interface I_PostOrderItem extends I_PostOrder {
  orderheaderid: number;
}

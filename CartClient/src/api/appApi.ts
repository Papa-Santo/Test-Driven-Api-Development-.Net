import { I_Id, I_PostOrder, I_PostOrderItem } from "./apiInterfaces";
import { appDelete, appGet, appPost } from "./appFetch";

export const getOrders = async () => {
  const orders = await appGet("order");
  // Check for OrderHeader
  responseChecker(orders[0], [
    "id",
    "status",
    "customer",
    "total",
    "lineitems",
  ]);

  // Check for LineItems
  if (orders[0].lineitems.length > 0) {
    responseChecker(orders[0].lineitems[0], [
      "id",
      "quantity",
      "price",
      "productid",
      "product",
      "orderheaderid",
      "orderheader",
    ]);

    // Check Product
    responseChecker(orders[0].lineitems[0].product, [
      "id",
      "name",
      "description",
      "price",
    ]);
  }
  return orders;
};

export const postOrder = async (params: I_PostOrder) =>
  await appPost("order", params);

export const getOrderById = async (params: I_Id) => {
  const order = await appGet("order/byid", params);
  // Check for OrderHeader
  responseChecker(order, ["id", "status", "customer", "total", "lineitems"]);

  // Check for LineItems
  if (order.lineitems.length > 0) {
    responseChecker(order.lineitems[0], [
      "id",
      "quantity",
      "price",
      "productid",
      "product",
      "orderheaderid",
      "orderheader",
    ]);

    // Check Product
    responseChecker(order.lineitems[0].product, [
      "id",
      "name",
      "description",
      "price",
    ]);
  }
  return order;
};

export const postOrderItem = async (params: I_PostOrderItem) =>
  await appPost("order/item", params);

export const postOrderCheckout = async (params: I_Id) =>
  await appPost("order/checkout", params);

export const deleteOrderHeader = async (params: I_Id) =>
  await appDelete("order", params.id);

export const deleteOrderItem = async (params: I_Id) =>
  await appDelete("order/lineitem", params.id);

export const deleteOrder = async (params: I_Id) =>
  await appDelete("order", params.id);

export const getProducts = async () => {
  const products = await appGet("product");
  responseChecker(products[0], ["id", "name", "description", "price"]);
  return products;
};

// Confirms the response has the correct fields
const responseChecker = (obj: any, arr: string[]) => {
  const keys = Object.keys(obj);
  if (keys.length !== arr.length)
    throw new Error("Amount of return fields changed in this API call");
  for (let key of arr) {
    if (!keys.includes(key))
      throw new Error("Something changed in the API for this call");
  }
};

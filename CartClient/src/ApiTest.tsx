import { useState } from "react";
import {
  deleteOrderHeader,
  deleteOrderItem,
  getOrderById,
  getOrders,
  getProducts,
  postOrder,
  postOrderCheckout,
  postOrderItem,
} from "./api/appApi";
import { I_Order, I_Product } from "./Interfaces";
import { I_PostOrder, I_PostOrderItem } from "./api/apiInterfaces";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

// This component will serve as our Swagger stand in
// We use it to test the api with Vitest and React
// Testing Library as an exercise.
// (I know it's not normal to test apis in that fashion :) )

const ApiTest = () => {
  const [message, setMessage] = useState<string>("");
  const [orders, setOrders] = useState<I_Order[]>([]);
  const [products, setProducts] = useState<I_Product[]>([]);
  const [order, setOrder] = useState<I_Order>();
  const [orderNum, setOrderNum] = useState(0);
  const [lineItemNum, setLineItemNum] = useState(0);
  const [deletedLineItemNum, setDeletedLineItemNum] = useState(0);
  const [orderStatus, setOrderStatus] = useState(0);
  const [lineItemLength, setLineItemLength] = useState(0);

  const allOrders = async () => {
    try {
      const orders: I_Order[] = await getOrders();
      setOrders(orders);
    } catch (err) {
      handleError(err);
    }
  };

  const allProducts = async () => {
    try {
      const products: I_Product[] = await getProducts();
      setProducts(products);
    } catch (err) {
      handleError(err);
    }
  };

  const oneOrder = async () => {
    setLineItemNum(0);
    setLineItemLength(0);
    try {
      const od: I_Order = await getOrderById({
        id: orderNum,
      });
      setOrder(od);
      setLineItemNum(od.lineitems[od.lineitems.length - 1].id);
      setLineItemLength(od.lineitems.length);
      setOrderStatus(od.status);
    } catch (err: any) {
      handleError(err);
    }
  };

  const addOrder = async () => {
    const item: I_PostOrder = { productid: 1, quantity: 2, userid: 1 };
    try {
      const result = await postOrder(item);
      setOrderNum(result.id);
      setOrder(undefined);
    } catch (err: any) {
      handleError(err);
    }
  };

  const addItemToOrder = async () => {
    setMessage("");
    const item: I_PostOrderItem = {
      productid: 3,
      quantity: 3,
      userid: 1,
      orderheaderid: orderNum,
    };
    try {
      await postOrderItem(item);
      setLineItemNum(0);
      setLineItemLength(0);
      setOrder(undefined);
    } catch (err: any) {
      handleError(err);
    }
  };

  const deleteItemFromOrder = async () => {
    setMessage("");
    const deletedId = order!.lineitems[order!.lineitems.length - 1].id;
    try {
      await deleteOrderItem({
        id: deletedId,
      });
      setDeletedLineItemNum(deletedId);
    } catch (err: any) {
      handleError(err);
    }
  };

  const deleteOrder = async () => {
    setMessage("");
    try {
      await deleteOrderHeader({
        id: orderNum,
      });
      setDeletedLineItemNum(0);
      setMessage("");
      setOrders([]);
      setProducts([]);
      setOrder(undefined);
      setOrderNum(0);
      setLineItemNum(0);
      setOrderStatus(0);
      setLineItemLength(0);
    } catch (err: any) {
      handleError(err);
    }
  };

  const checkoutOrder = async () => {
    setMessage("");
    try {
      await postOrderCheckout({
        id: orderNum,
      });
      setOrderStatus(0);
      oneOrder();
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    let msg = "An error has occurred";
    if (err.message) msg = err.message;
    setMessage(msg);
  };

  return (
    <div>
      <button role="allProductsBtn" onClick={allProducts}>
        All Products
      </button>
      <button role="allOrdersBtn" onClick={allOrders}>
        All Orders
      </button>
      <button role="addOrderBtn" onClick={() => addOrder()}>
        Add Order And Item
      </button>
      <button
        disabled={!orderNum}
        role="oneOrderBtn"
        onClick={() => oneOrder()}
      >
        One Order
      </button>
      <button
        disabled={!orderNum}
        role="addItemToOrderBtn"
        onClick={() => addItemToOrder()}
      >
        Add Item To Order
      </button>
      <button
        disabled={!orderNum}
        role="deleteItemFromOrderBtn"
        onClick={() => deleteItemFromOrder()}
      >
        Delete Item From Order
      </button>
      <button
        disabled={!orderNum}
        role="checkoutOrderBtn"
        onClick={() => checkoutOrder()}
      >
        Checkout Order
      </button>
      <button
        disabled={!orderNum}
        role="deleteOrderBtn"
        onClick={() => deleteOrder()}
      >
        Delete Order
      </button>
      {message && (
        <div>
          <h5 role="message">{message}</h5>
        </div>
      )}
      {orderNum > 0 && (
        <div>
          <h3>Order Number: </h3>
          <p role="orderNumber">{orderNum}</p>
        </div>
      )}
      {orderStatus > 0 && (
        <div>
          <h3>Order Status: </h3>
          <p role="orderStatus">{orderStatus}</p>
        </div>
      )}
      {lineItemLength > 0 && (
        <div>
          <h3>Line Item Length: </h3>
          <p role="lineItemLength">{lineItemLength}</p>
        </div>
      )}
      {lineItemNum > 0 && (
        <div>
          <h3>Line Item Number: </h3>
          <p role="lineItemNum">{lineItemNum}</p>
        </div>
      )}
      {deletedLineItemNum > 0 && (
        <div>
          <h3>Deleted Line Item Number: </h3>
          <p role="deletedLineItemNum">{deletedLineItemNum}</p>
        </div>
      )}
      {order && (
        <div>
          <h3>Order:</h3>
          <div role="displayOneOrder">
            <JsonView src={order} />
          </div>
        </div>
      )}
      {orders.length > 0 && (
        <div>
          <h3>All Orders</h3>
          <div role="displayAllOrders">
            <JsonView src={orders} />
          </div>
        </div>
      )}
      {products.length > 0 && (
        <div>
          <h3>All Products</h3>
          <div role="displayAllProducts">
            <JsonView src={products} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;

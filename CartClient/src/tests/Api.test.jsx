import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import App from "../App";

describe("API Works As Expected", () => {
  it("Can retrieve products", async () => {
    render(<App />);
    const allProductsBtn = screen.getByRole("allProductsBtn");
    fireEvent.click(allProductsBtn);
    const displayAllProducts = await waitFor(() =>
      screen.getByRole("displayAllProducts")
    );
    expect(displayAllProducts).toBeInTheDocument();
  });

  it("Can create orders", async () => {
    render(<App />);
    const addOrderBtn = screen.getByRole("addOrderBtn");
    fireEvent.click(addOrderBtn);
    const orderNumber = await waitFor(() => screen.getByRole("orderNumber"));
    expect(orderNumber).toBeInTheDocument();

    const deleteOrderBtn = screen.getByRole("deleteOrderBtn");
    fireEvent.click(deleteOrderBtn);
  });

  it("Can retrieve orders", async () => {
    render(<App />);
    const allOrdersBtn = screen.getByRole("allOrdersBtn");
    fireEvent.click(allOrdersBtn);
    const displayAllOrders = await waitFor(() =>
      screen.getByRole("displayAllOrders")
    );
    expect(displayAllOrders).toBeInTheDocument();
  });

  it("Can do order item CRUD", async () => {
    render(<App />);

    // CREATE: Add an order with a line item
    const addOrderBtn = screen.getByRole("addOrderBtn");
    fireEvent.click(addOrderBtn);
    await waitFor(() => screen.getByRole("orderNumber"));

    // READ: Retrieve the order
    const oneOrderBtn = screen.getByRole("oneOrderBtn");
    fireEvent.click(oneOrderBtn);

    // Save the current last line item id
    let lineItemNum = (await waitFor(() => screen.getByRole("lineItemNum")))
      .innerHTML;

    // UPDATE: Add line item to order
    const addItemToOrderBtn = screen.getByRole("addItemToOrderBtn");
    fireEvent.click(addItemToOrderBtn);
    await waitForElementToBeRemoved(() => screen.getByRole("lineItemNum"));

    // Retrieve order
    fireEvent.click(oneOrderBtn);

    // Save the new current last line item id
    const lineItemNumTwo = (
      await waitFor(() => screen.getByRole("lineItemNum"))
    ).innerHTML;

    // Save line item length
    const lineItemlength = (
      await waitFor(() => screen.getByRole("lineItemLength"))
    ).innerHTML;

    // Iterate first line item id and compare to the new line item id
    expect(lineItemNumTwo).toBe((parseInt(lineItemNum) + 1).toString());

    // Add another line item with the same product id to check cart length does not change
    fireEvent.click(addItemToOrderBtn);
    await waitForElementToBeRemoved(() => screen.getByRole("lineItemNum"));

    // Retrieve order
    fireEvent.click(oneOrderBtn);

    // Save new line item length
    const lineItemlengthTwo = (
      await waitFor(() => screen.getByRole("lineItemLength"))
    ).innerHTML;

    // Make sure a new orderline is not created
    expect(lineItemlength).toBe(lineItemlengthTwo);

    // Retrieve order
    fireEvent.click(oneOrderBtn);

    // DELETE: Delete item from order
    const deleteItemFromOrderBtn = screen.getByRole("deleteItemFromOrderBtn");
    fireEvent.click(deleteItemFromOrderBtn);

    // Save the deleted line id
    const deletedLineItemNum = await waitFor(
      () => screen.getByRole("deletedLineItemNum").innerHTML
    );

    // Retrieve the order
    fireEvent.click(oneOrderBtn);
    await waitFor(() => screen.getByRole("displayOneOrder"));

    // Get current last line item from order
    const lineItemNum3 = screen.getByRole("lineItemNum").innerHTML;

    // Check the line items are decremented
    expect(parseInt(deletedLineItemNum) - 1).toBe(parseInt(lineItemNum3));

    const deleteOrderBtn = screen.getByRole("deleteOrderBtn");
    fireEvent.click(deleteOrderBtn);
  });

  it("Can checkout order and stop order changes", async () => {
    render(<App />);

    // Add an order with a line item
    const addOrderBtn = screen.getByRole("addOrderBtn");
    fireEvent.click(addOrderBtn);

    // Retrieve the order
    await waitFor(() => screen.getByRole("orderNumber"));

    // Checkout
    const checkoutOrderBtn = screen.getByRole("checkoutOrderBtn");
    fireEvent.click(checkoutOrderBtn);

    await waitFor(() => screen.getByRole("orderStatus"));

    // Check add item error
    const addItemToOrderBtn = screen.getByRole("addItemToOrderBtn");
    fireEvent.click(addItemToOrderBtn);
    const message = await waitFor(() => screen.getByRole("message"));
    expect(message.innerHTML).toBe("This order has been placed");

    // Check delete item error
    const deleteItemFromOrderBtn = screen.getByRole("deleteItemFromOrderBtn");
    fireEvent.click(deleteItemFromOrderBtn);
    const message2 = await waitFor(() => screen.getByRole("message"));
    expect(message2.innerHTML).toBe("This order has already been placed");

    // Check checkout error
    fireEvent.click(checkoutOrderBtn);
    const message3 = await waitFor(() => screen.getByRole("message"));
    expect(message3.innerHTML).toBe("This order has already been submitted");

    const deleteOrderBtn = screen.getByRole("deleteOrderBtn");
    fireEvent.click(deleteOrderBtn);
  });
});

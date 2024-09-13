/// <reference types="cypress" />

const base = "http://localhost:5090/api/";
const item = { productid: 1, quantity: 2, userid: 1 };
const itemTwo = {
  productid: 3,
  quantity: 3,
  userid: 1,
};

context("Network Requests", () => {
  it("cy.gets-all-products", () => {
    cy.request(`${base}product`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body[0]).to.include.keys(
        "id",
        "name",
        "description",
        "price"
      );
    });
  });

  it("cy.posts-order", () => {
    // Create Order
    cy.request("POST", `${base}order`, item).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include.keys("id");
      cy.wrap(response.body.id).as("id");
    });

    // Delete Order
    cy.get("@id").then((id) => {
      cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include.keys("success");
      });
    });
  });

  it("cy.retrieves-order-by-id", () => {
    // Create Order
    cy.request("POST", `${base}order`, item).then((response) => {
      cy.wrap(response.body.id).as("id");
    });

    // Get Order By ID
    cy.get("@id").then((id) => {
      cy.request({
        url: `${base}order/byid`,
        qs: {
          id: id,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.lineitems[0]).to.include.keys(
          "id",
          "quantity",
          "price",
          "productid",
          "product",
          "orderheaderid",
          "orderheader"
        );
        expect(response.body.lineitems[0].product).to.include.keys(
          "id",
          "name",
          "description",
          "price"
        );
        expect(response.body.lineitems).to.be.an("array").and.have.lengthOf(1);
        expect(response.body.total).eq(
          response.body.lineitems[0].price * response.body.lineitems[0].quantity
        );
        expect(response.body.customer).eq(1);
        expect(response.body.lineitems[0].productid).eq(1);
        expect(response.body.lineitems[0].quantity).eq(2);
        expect(response.body.lineitems[0].price).eq(
          response.body.lineitems[0].product.price
        );
        // Delete Order
        cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.include.keys("success");
        });
      });
    });
  });

  it("cy.deletes-an-order", () => {
    // Create Order
    cy.request("POST", `${base}order`, item).then((response) => {
      cy.wrap(response.body.id).as("id");
    });

    // Get Order By ID
    cy.get("@id").then((id) => {
      cy.request({
        url: `${base}order/byid`,
        qs: {
          id: id,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      // Delete Order
      cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include.keys("success");
      });

      // Get Deleted Order By Id
      cy.request({
        url: `${base}order/byid`,
        failOnStatusCode: false,
        qs: {
          id: id,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  it("cy.gets-order-list", () => {
    // Create Order
    cy.request("POST", `${base}order`, item).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include.keys("id");
      cy.wrap(response.body.id).as("id");
    });

    // Get Order List
    cy.request(`${base}order`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body[response.body.length - 1]).to.include.keys(
        "id",
        "status",
        "customer",
        "total",
        "lineitems"
      );
    });

    // Deletes Order
    cy.get("@id").then((id) => {
      cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include.keys("success");
      });
    });
  });

  it("cy.adds-items-to-order", () => {
    // Create Order
    cy.request("POST", `${base}order`, item).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include.keys("id");
      cy.wrap(response.body.id).as("id");
    });

    // Add item to order by id
    cy.get("@id").then((id) => {
      cy.request("POST", `${base}order/item`, {
        ...itemTwo,
        orderheaderid: id,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.include.keys("id");
      });

      // Get Order By ID
      cy.request({
        url: `${base}order/byid`,
        qs: {
          id: id,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.lineitems).to.be.an("array").and.have.lengthOf(2);
        expect(response.body.total).eq(31.95);

        // Delete Order
        cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.include.keys("success");
        });
      });
    });
  });

  it("cy.adds-items-and-increases-qty", () => {
    // Creates Order
    cy.request("POST", `${base}order`, item).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include.keys("id");
      cy.wrap(response.body.id).as("id");
    });

    // Update Order By ID
    cy.get("@id").then((id) => {
      cy.request("POST", `${base}order/item`, {
        ...itemTwo,
        orderheaderid: id,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.include.keys("id");
      });
      cy.request({
        url: `${base}order/byid`,
        qs: {
          id: id,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.lineitems).to.be.an("array").and.have.lengthOf(2);
      });

      // Delete Order
      cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include.keys("success");
      });
    });
  });

  it("cy.deletes-item-from-order", () => {
    // Creates Order
    cy.request("POST", `${base}order`, item).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include.keys("id");
      cy.wrap(response.body.id).as("id");
    });

    // Get Order By ID
    cy.get("@id").then((id) => {
      cy.request({
        url: `${base}order/byid`,
        qs: {
          id: id,
        },
      }).then((response) => {
        expect(response.body.lineitems).to.be.an("array").and.have.lengthOf(1);
        cy.wrap(response.body.lineitems[0].id).as("line");
      });

      // Delete Line
      cy.get("@line").then((line) => {
        cy.request("DELETE", `${base}order/lineitem?id=${line}`).then(
          (response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include.keys("success");
          }
        );

        // Get Order By ID and check line item is removed
        cy.request({
          url: `${base}order/byid`,
          qs: {
            id: id,
          },
        }).then((response) => {
          expect(response.body.lineitems)
            .to.be.an("array")
            .and.have.lengthOf(0);
        });
      });

      // Delete Order
      cy.request("DELETE", `${base}order?id=${id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include.keys("success");
      });
    });
  });

  it("cy.checked-out-order-cannot-be-updated", () => {
    // Create Order
    cy.request("POST", `${base}order`, item).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include.keys("id");
      cy.wrap(response.body.id).as("id");
    });

    // Checkout Order
    cy.get("@id").then((id) => {
      cy.request("POST", `${base}order/checkout`, { id: id }).then(
        (response) => {
          expect(response.status).to.eq(200);
        }
      );

      // Get Order By ID
      cy.get("@id").then((id) => {
        cy.request({
          url: `${base}order/byid`,
          qs: {
            id: id,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq(1);
          cy.wrap(response.body.lineitems[0].id).as("item");
        });

        // Check order cannot be updated by item
        cy.request({
          method: "POST",
          url: `${base}order/item`,
          failOnStatusCode: false,
          body: {
            ...itemTwo,
            orderheaderid: id,
          },
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq("This order has been placed");
        });
      });

      cy.get("@item").then((item) => {
        // Check order cannot be updated by delete item
        cy.request({
          method: "Delete",
          url: `${base}order/lineitem?id=${item}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "This order has already been placed"
          );
        });
      });
      // Delete Order
      cy.get("@id").then((id) => {
        cy.request("DELETE", `${base}order?id=${id}`, item).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.include.keys("success");
        });
      });
    });
  });
});

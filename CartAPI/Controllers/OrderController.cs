using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CartAPI.Models;
using CartAPI.Data;
using CartAPI.Helpers;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace CartAPI.Controllers
{
    [Route("api/Order")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderHeader>>> GetOrders()
        {
            return await _context.orderheader.Include(x => x.lineitems!).ThenInclude(c => c.product).ToListAsync();
        }

        // GET: api/Order/5
        [HttpGet]
        [Route("byid")]
        public async Task<ActionResult<OrderHeader>> GetOrderById(int id)
        {
            OrderHeader? orderHeader = await _context.orderheader.Include(x => x.lineitems!).ThenInclude(c => c.product).FirstOrDefaultAsync(x => x.id == id);
            if (orderHeader == null)
            {
                return BadRequest(new { message = "This order could not be found" });
            }
            if (orderHeader.lineitems != null)
            {
                orderHeader.total = UpdatePriceHelper.UpdatedPrice(orderHeader.lineitems.ToList());
            }


            return Ok(orderHeader);
        }

        // POST: api/Order
        /// <summary>
        /// Sample documentation even though the course will not be using swagger
        /// </summary>
        /// <param name="lineItem"></param>
        /// <returns>201, lineItemId</returns>
        [HttpPost]
        public async Task<ActionResult<CreationDto>> PostOrder([FromBody] OrderLineItemDto lineItem)
        {
            Product? product = await _context.product.FirstOrDefaultAsync(x => x.id == lineItem.productid);
            if (product == null)
            {
                return BadRequest(new { message = "This product could not be found" });
            }
            OrderHeader orderHead = new OrderHeader { total = product.price * lineItem.quantity, customer = lineItem.userid };
            _context.orderheader.Add(orderHead);
            await _context.SaveChangesAsync();

            LineItem lineitemsend = new LineItem
            {
                orderheaderid = orderHead.id,
                quantity = lineItem.quantity,
                price = product.price,
                productid = lineItem.productid,
            };
            _context.lineitem.Add(lineitemsend);

            // Save context and return
            await _context.SaveChangesAsync();
            return CreatedAtAction("PostOrder", new CreationDto
            {
                Id = orderHead.id
            });
        }

        // POST: api/Order/Item
        [HttpPost]
        [Route("Item")]
        public async Task<ActionResult<CreationDto>> PostOrderItem([FromBody] LineItemDto lineItem)
        {
            OrderHeader? orderHead;
            // We want to update quantities if more of the same product is added without adding a lineitem
            bool addLineItem = true;
            // Check order exists and still has shopping status
            orderHead = await _context.orderheader.Include(x => x.lineitems!).ThenInclude(c => c.product).FirstOrDefaultAsync(x => x.id == lineItem.orderheaderid);
            if (orderHead == null) return BadRequest(new { message = "This order could not be found" }); ;
            // Check that the order status is shopping
            if (orderHead.status != OrderStatus.Shopping) return BadRequest(new { message = "This order has been placed" });
            // Ensure Product Exists
            Product? product = await _context.product.FirstOrDefaultAsync(x => x.id == lineItem.productid);
            if (product == null)
            {
                return BadRequest(new { message = "This product could not be found" });
            }
            // Make line item from dto
            LineItem lineitemsend = new LineItem
            {
                orderheaderid = orderHead.id,
                quantity = lineItem.quantity,
                price = product.price,
                productid = lineItem.productid,
            };
            // Set price to 0
            decimal price = 0;
            // If the cart is not empty
            if (orderHead.lineitems != null)
            {
                List<LineItem> items = orderHead.lineitems.ToList();
                // Check for lineitem product in items and fix for quantity
                foreach (LineItem item in items)
                {
                    if (item.productid == lineItem.productid)
                    {
                        item.quantity += lineItem.quantity;
                        addLineItem = false;
                        break;
                    }
                };
                // update the price variable
                LineItem? lineUpdate = lineitemsend;
                if (!addLineItem) { lineUpdate = null; };
                price = UpdatePriceHelper.UpdatedPrice(items, lineUpdate);
            }
            // Set the price
            orderHead.total = price;
            // The quantity was not updated add lineitem
            if (addLineItem) _context.lineitem.Add(lineitemsend);
            // Save context and return
            _context.Entry(orderHead).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return CreatedAtAction("PostOrderItem", new CreationDto
            {
                Id = orderHead.id
            });
        }

        // POST: api/Order/Checkout
        [HttpPost]
        [Route("Checkout")]
        public async Task<ActionResult<CreationDto>> Checkout([FromBody] OrderSubmit submit)
        {
            OrderHeader? orderHead;
            // Check order exists
            orderHead = await _context.orderheader.Include(x => x.lineitems!).ThenInclude(c => c.product).FirstOrDefaultAsync(x => x.id == submit.id);
            if (orderHead == null)
            {
                return BadRequest(new { message = "This order could not be found" });
            }
            // Only update the price if the order is still in shopping status
            if (orderHead.status == 0)
            {

                if (orderHead.lineitems == null)
                {
                    return BadRequest(new { message = "This order is empty" });
                }
                List<LineItem> items = [.. orderHead.lineitems];
                decimal currentPrice = orderHead.total;
                decimal price = UpdatePriceHelper.UpdatedPrice(items);

                // Maybe warn the user that the price changed
                // if( currentPrice != price ){}
                orderHead.total = price;

                OrderStatus status = OrderStatus.Open;
                orderHead.status = status;
                _context.Entry(orderHead).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(new CreationDto
                {
                    Id = orderHead.id
                });
            }
            else
            {
                return BadRequest(new { message = "This order has already been submitted" });
            }
        }

        // DELETE: api/Order/?id=5
        [HttpDelete]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var orderHeader = await _context.orderheader.Include(x => x.lineitems).FirstOrDefaultAsync(order => order.id == id);
            if (orderHeader == null)
            {
                return BadRequest(new { message = "This order could not be found" });
            }

            // We will allow deletes in dev
            // if (orderHeader.status != 0)
            // {
            //     return BadRequest(new { message = "This order has already been placed" });
            // }

            _context.orderheader.Remove(orderHeader);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        // DELETE: api/Order/LineItem/?id=5
        [Route("LineItem")]
        [HttpDelete]
        public async Task<IActionResult> DeleteOrderLineItem(int id)
        {
            var lineItem = await _context.lineitem.Include(x => x.orderheader).FirstOrDefaultAsync(item => item.id == id);
            if (lineItem == null)
            {
                return BadRequest(new { message = "This order could not be found" });
            }
            if (lineItem.orderheader != null && lineItem.orderheader.status != 0)
            {
                return BadRequest(new { message = "This order has already been placed" });
            }

            int orderheaderid = lineItem.orderheaderid;

            _context.lineitem.Remove(lineItem);
            await _context.SaveChangesAsync();



            OrderHeader? orderHead;
            orderHead = await _context.orderheader.Include(x => x.lineitems!).ThenInclude(c => c.product).FirstOrDefaultAsync(x => x.id == orderheaderid);

            // The if the order head is deleted the casacading delete would handle the item
            // This check is strictly for intellisence
            if (orderHead != null)
            {
                if (orderHead.lineitems != null)
                {
                    List<LineItem> items = orderHead.lineitems.ToList();
                    orderHead.total = UpdatePriceHelper.UpdatedPrice(items, null);
                }
                else
                {
                    orderHead.total = 0;
                }

                _context.Entry(orderHead).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true });
        }
        // Consider what else you could do with this
        // Send in order to confirm item is attached to order
        // Check the user who sent this in is the owner of this order - Requires identity to do this properly
    }
}
using CartAPI.Models;
namespace CartAPI.Helpers
{
    public class UpdatePriceHelper
    {
        public static decimal UpdatedPrice(List<LineItem> items, LineItem? itemToAdd = null)
        {
            decimal price = 0;

            foreach (LineItem item in items)
            {
                // Update the line item price with the current product price
                item.price = item.product!.price;
                // Add up all the items for a total price
                price += item.price * item.quantity;
            }
            if (itemToAdd != null)
            {
                price += itemToAdd.price * itemToAdd.quantity;
            }
            return price;
        }
    }
}
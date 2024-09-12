using System.ComponentModel.DataAnnotations;
using System.Collections;


namespace CartAPI.Models;

public class LineItem
{
    [Key]
    public int id { get; set; }
    public required int quantity { get; set; }
    public required decimal price { get; set; }
    public required int productid { get; set; }
    public Product? product { get; set; }
    public required int orderheaderid { get; set; }
    public OrderHeader? orderheader { get; set; }
}

public class OrderLineItemDto
{
    public required int quantity { get; set; }
    public required int productid { get; set; }
    public int userid { get; set; }
}

public class LineItemDto : OrderLineItemDto
{
    public required int orderheaderid { get; set; }
}
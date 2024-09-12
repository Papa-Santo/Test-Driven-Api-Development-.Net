using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace CartAPI.Models;

public enum OrderStatus
{
    Shopping,
    Open,
    Picked,
    Packaged,
    Shipped,
    Cancelled
}

public class OrderHeader
{
    [Key]
    public int id { get; set; }
    public OrderStatus status { get; set; } = OrderStatus.Shopping;
    // To explain about the use of order headers
    public required int customer { get; set; }
    public required decimal total { get; set; }
    public ICollection<LineItem>? lineitems { get; set; }
}

public class OrderSubmit
{
    public int id { get; set; }
}
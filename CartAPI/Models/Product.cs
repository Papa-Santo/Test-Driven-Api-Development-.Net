using System.ComponentModel.DataAnnotations;

namespace CartAPI.Models;

public class Product
{
    [Key]
    public int id { get; set; }
    public required string name { get; set; }
    public string? description { get; set; }
    public required decimal price { get; set; }
}
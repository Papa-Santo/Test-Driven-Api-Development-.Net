using Microsoft.EntityFrameworkCore;
using CartAPI.Models;

namespace CartAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }
    public DbSet<Product> product { get; set; }
    public DbSet<LineItem> lineitem { get; set; }
    public DbSet<OrderHeader> orderheader { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                id = 1,
                name = "Dog Food",
                description = "Your dog will love our beef and rice flavored dry dog food.",
                price = 9.99M
            },
            new Product
            {
                id = 2,
                name = "Cat Food",
                description = "Your cat will passively enjoy our salmon flavored wet cat food.",
                price = 12.99M
            },
            new Product
            {
                id = 3,
                name = "Lizard Food",
                description = "Your lizard likes to eat bugs. So this is made of bugs.",
                price = 3.99M
            }
        );
        modelBuilder.Entity<OrderHeader>()
            .HasMany(e => e.lineitems)
            .WithOne(e => e.orderheader)
            .OnDelete(DeleteBehavior.ClientCascade);
    }


}
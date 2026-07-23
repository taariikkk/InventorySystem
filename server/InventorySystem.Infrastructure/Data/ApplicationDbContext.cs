using InventorySystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ovdje ćemo dodati Fluent API konfiguracije
        // 1. Preciznost za decimalne vrijednosti (da izbjegnemo EF Core warninge)
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasPrecision(18, 2);

        // 2. Globalni filter za Soft Delete
        // Kada god radimo upit nad Products, automatski će se isključiti obrisani proizvodi
        modelBuilder.Entity<Product>()
            .HasQueryFilter(p => !p.IsDeleted);

        // 3. Jedinstveni SKU za proizvode
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.SKU)
            .IsUnique();
    }
}
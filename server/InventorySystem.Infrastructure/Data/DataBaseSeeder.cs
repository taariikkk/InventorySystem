using InventorySystem.Application.Interfaces;
using InventorySystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        // Osiguravamo da je baza kreirana i da su sve migracije primijenjene
        await context.Database.MigrateAsync();

        // 1. SEEDOVANJE KORISNIKA
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new() {
                    Username = "admin",
                    Email = "admin@test.com",
                    PasswordHash = passwordHasher.HashPassword("password123"),
                    Role = UserRole.Admin
                },
                new() {
                    Username = "manager",
                    Email = "manager@test.com",
                    PasswordHash = passwordHasher.HashPassword("password123"),
                    Role = UserRole.Manager
                },
                new() {
                    Username = "worker",
                    Email = "worker@test.com",
                    PasswordHash = passwordHasher.HashPassword("password123"),
                    Role = UserRole.Worker
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        // 2. SEEDOVANJE PROIZVODA
        if (!await context.Products.AnyAsync())
        {
            var products = new List<Product>
            {
                new() { Name = "iPhone 15 Pro", SKU = "AAPL-IPH15P", Description = "Apple pametni telefon 128GB", Price = 2400.00m, StockQuantity = 15 },
                new() { Name = "MacBook Pro 14", SKU = "AAPL-MBP14", Description = "M3 Chip, 16GB RAM, 512GB SSD", Price = 3800.00m, StockQuantity = 8 },
                new() { Name = "Dell XPS 15", SKU = "DELL-XPS15", Description = "Intel i7, 32GB RAM, NVIDIA RTX", Price = 3500.00m, StockQuantity = 5 },
                new() { Name = "Sony WH-1000XM5", SKU = "SONY-MX5", Description = "Bežične ANC slušalice", Price = 700.00m, StockQuantity = 20 },
                new() { Name = "Logitech MX Master 3S", SKU = "LOGI-MX3S", Description = "Ergonomski miš", Price = 220.00m, StockQuantity = 4 }, // Niska zaliha (< 5) za trigger upozorenja
                new() { Name = "Samsung Odyssey G7", SKU = "SAMS-G7", Description = "32-inčni zakrivljeni gaming monitor", Price = 1200.00m, StockQuantity = 12 },
                new() { Name = "Keychron K2 V2", SKU = "KEYC-K2", Description = "Mehanička tastatura", Price = 180.00m, StockQuantity = 25 },
                new() { Name = "iPad Pro 11", SKU = "AAPL-IPAD11", Description = "Apple M2, Liquid Retina display", Price = 1900.00m, StockQuantity = 10 }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }

        // 3. SEEDOVANJE ISTORIJSKIH NARUDŽBI (Za grafikone)
        if (!await context.Orders.AnyAsync())
        {
            var products = await context.Products.ToListAsync();
            var orders = new List<Order>();

            // Kreiramo narudžbe raspoređene kroz zadnjih 5 mjeseci
            for (int i = 5; i >= 0; i--)
            {
                var orderDate = DateTime.UtcNow.AddMonths(-i);

                // Kreiramo 2 narudžbe po mjesecu sa nasumičnim artiklima
                for (int j = 1; j <= 2; j++)
                {
                    var rand = new Random();
                    var p1 = products[rand.Next(products.Count)];
                    var p2 = products[rand.Next(products.Count)];

                    var orderItems = new List<OrderItem>
                    {
                        new() { ProductId = p1.Id, Quantity = rand.Next(1, 3), UnitPrice = p1.Price },
                        new() { ProductId = p2.Id, Quantity = rand.Next(1, 2), UnitPrice = p2.Price }
                    };

                    var order = new Order
                    {
                        OrderNumber = $"ORD-SEED-{orderDate.Month}{orderDate.Year}-{j}",
                        OrderDate = orderDate,
                        Status = OrderStatus.Completed,
                        OrderItems = orderItems
                    };
                    order.CalculateTotal();
                    orders.Add(order);
                }
            }

            await context.Orders.AddRangeAsync(orders);
            await context.SaveChangesAsync();
        }
    }
}
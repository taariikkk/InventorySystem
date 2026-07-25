using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using InventorySystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Application.Services;

public class OrderService : IOrderService
{
    private readonly DbContext _context;

    public OrderService(DbContext context)
    {
        _context = context;
    }

    // 1. KREIRANJE NARUDŽBE SA TRANSAKCIJSKOM SIGURNOŠĆU
    public async Task<OrderResponse> CreateOrderAsync(OrderRequest request)
    {
        if (request.Items == null || !request.Items.Any())
            throw new ArgumentException("Narudžba mora sadržavati barem jednu stavku.");

        // Pokrećemo eksplicitnu transakciju nad bazom podataka
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var orderItems = new List<OrderItem>();
            var productSet = _context.Set<Product>();

            // Prolazimo kroz sve tražene stavke iz zahtjeva
            foreach (var itemRequest in request.Items)
            {
                // Pronalazimo proizvod u bazi
                var product = await productSet.FindAsync(itemRequest.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Proizvod sa ID-em {itemRequest.ProductId} ne postoji.");

                // Pozivamo domensku logiku unutar Product entiteta koja provjerava i smanjuje zalihu
                // Ako zaliha nije dovoljna, ova metoda će sama baciti InvalidOperationException
                product.ReduceStock(itemRequest.Quantity);

                // Kreiramo stavku narudžbe
                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = itemRequest.Quantity,
                    UnitPrice = product.Price // Zamrzavamo trenutnu cijenu proizvoda!
                };

                orderItems.Add(orderItem);
            }

            // Generišemo jedinstveni broj narudžbe
            var orderNumber = $"ORD-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            // Kreiramo narudžbu
            var order = new Order
            {
                OrderNumber = orderNumber,
                Status = OrderStatus.Pending,
                OrderItems = orderItems
            };

            // Računamo ukupnu cijenu (izračunava se sabiranjem UnitPrice * Quantity za sve stavke)
            order.CalculateTotal();

            // Dodajemo narudžbu u bazu i spašavamo promjene
            _context.Set<Order>().Add(order);
            await _context.SaveChangesAsync();

            // Ako je sve prošlo bez greške, potvrđujemo (Commit-ujemo) transakciju
            // Tek u ovom trenutku se sve promjene trajno upisuju u bazu podataka!
            await transaction.CommitAsync();

            // Mapiramo narudžbu u odgovor
            return MapToResponse(order);
        }
        catch (Exception)
        {
            // Ako se desila BILO KAKVA greška (nedostatak zaliha, pad mreže, nepostojeći proizvod),
            // poništavamo (Rollback-ujemo) sve promjene. Baza ostaje netaknuta.
            await transaction.RollbackAsync();
            throw; // Proslijeđujemo grešku dalje kontroleru
        }
    }

    // 2. PREGLED SVIH NARUDŽBI SA PAGINACIJOM
    public async Task<PagedResponse<OrderResponse>> GetOrdersAsync(int pageNumber, int pageSize)
    {
        var query = _context.Set<Order>()
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product) // Učitavamo proizvode unutar stavki (Eager Loading)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderDate) // Najnovije narudžbe idu prve
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mappedOrders = orders.Select(MapToResponse).ToList();

        return new PagedResponse<OrderResponse>(mappedOrders, totalCount, pageNumber, pageSize);
    }

    // 3. DETALJI JEDNE NARUDŽBE
    public async Task<OrderResponse?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Set<Order>()
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        return MapToResponse(order);
    }

    // Pomoćna metoda za mapiranje Order entiteta u OrderResponse DTO
    private static OrderResponse MapToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OrderDate = order.OrderDate,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Items = order.OrderItems.Select(oi => new OrderItemResponse
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name ?? "Nepoznat proizvod (obrisan)", // Ako je proizvod soft-deletovan
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        };
    }
}
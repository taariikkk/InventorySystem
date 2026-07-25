using System.Globalization;
using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using InventorySystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly DbContext _context;

    public DashboardService(DbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryResponse> GetDashboardSummaryAsync()
    {
        // 1. Osnovne metrike (Brojanje i sabiranje)
        var totalProducts = await _context.Set<Product>().CountAsync(); // Isključuje soft-deleted zbog globalnog filtera!
        var totalOrders = await _context.Set<Order>().CountAsync();
        var totalRevenue = await _context.Set<Order>()
            .Where(o => o.Status != OrderStatus.Cancelled) // Ne računamo otkazane narudžbe
            .SumAsync(o => o.TotalAmount);

        // 2. TOP 5 NAJPRODAVANIJIH PROIZVODA (Grupisanje po proizvodu)
        var topProducts = await _context.Set<OrderItem>()
            .Include(oi => oi.Product)
            .GroupBy(oi => new { oi.ProductId, ProductName = oi.Product != null ? oi.Product.Name : "Obrisan proizvod" })
            .Select(g => new TopProductResponse
            {
                ProductName = g.Key.ProductName,
                TotalQuantitySold = g.Sum(oi => oi.Quantity),
                TotalRevenueGenerated = g.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .OrderByDescending(tp => tp.TotalQuantitySold)
            .Take(5)
            .ToListAsync();

        // 3. PRIHOD PO MJESECIMA ZA GRAPH (Zadnjih 6 mjeseci)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5); // Uzimamo trenutni mjesec + 5 prethodnih

        // Kreiramo datum i eksplicitno mu dodjeljujemo UTC zonu (DateTimeKind.Utc)
        var startDate = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var orders = await _context.Set<Order>()
            .Where(o => o.OrderDate >= startDate && 
                        o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        // Grupisanje radimo u memoriji jer moramo formatirati nazive mjeseci na našem jeziku
        var monthlyRevenue = orders
            .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
            .Select(g => new MonthlyRevenueResponse
            {
                Month = GetMonthName(g.Key.Month) + " " + g.Key.Year,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(m => m.Month) // Sortiranje hronološki (ako je potrebno, ali za demo je dovoljno abecedno/mjeseci)
            .ToList();

        return new DashboardSummaryResponse
        {
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            TopProducts = topProducts,
            MonthlyRevenue = monthlyRevenue
        };
    }

    // Pomoćna metoda za nazive mjeseci na našem jeziku
    private static string GetMonthName(int month)
    {
        return month switch
        {
            1 => "Januar",
            2 => "Februar",
            3 => "Mart",
            4 => "April",
            5 => "Maj",
            6 => "Jun",
            7 => "Jul",
            8 => "Avgust",
            9 => "Septembar",
            10 => "Oktobar",
            11 => "Novembar",
            12 => "Decembar",
            _ => ""
        };
    }
}
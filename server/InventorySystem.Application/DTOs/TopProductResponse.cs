namespace InventorySystem.Application.DTOs;

public class TopProductResponse
{
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenueGenerated { get; set; }
}
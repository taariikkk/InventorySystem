namespace InventorySystem.Application.DTOs;

public class MonthlyRevenueResponse
{
    public string Month { get; set; } = string.Empty; // Npr. "Januar", "Februar"
    public decimal Revenue { get; set; }
}
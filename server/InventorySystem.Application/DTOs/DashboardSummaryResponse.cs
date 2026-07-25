namespace InventorySystem.Application.DTOs;

public class DashboardSummaryResponse
{
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<TopProductResponse> TopProducts { get; set; } = new();
    public List<MonthlyRevenueResponse> MonthlyRevenue { get; set; } = new();
}
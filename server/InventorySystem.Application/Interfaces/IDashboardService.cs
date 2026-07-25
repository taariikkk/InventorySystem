using InventorySystem.Application.DTOs;

namespace InventorySystem.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetDashboardSummaryAsync();
}
using InventorySystem.Application.DTOs;

namespace InventorySystem.Application.Interfaces;

public interface IOrderService
{
    // Kreiranje nove narudžbe (Transakciono)
    Task<OrderResponse> CreateOrderAsync(OrderRequest request);

    // Pregled svih narudžbi sa paginacijom
    Task<PagedResponse<OrderResponse>> GetOrdersAsync(int pageNumber, int pageSize);

    // Detalji jedne narudžbe
    Task<OrderResponse?> GetOrderByIdAsync(int id);
}
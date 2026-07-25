namespace InventorySystem.Application.DTOs;

public class OrderRequest
{
    public List<OrderItemRequest> Items { get; set; } = new();
}
using InventorySystem.Domain.Common;
using System.Collections.Generic;
namespace InventorySystem.Domain.Entities;

public enum OrderStatus
{
    Pending,
    Completed,
    Cancelled
}
public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; private set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public void CalculateTotal()
    {
        TotalAmount = OrderItems.Sum(item => item.Quantity * item.UnitPrice);
    }
}
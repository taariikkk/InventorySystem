namespace InventorySystem.Domain.Entities;
using InventorySystem.Domain.Common;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }

    // Logika za promjenu zaliha
    public void ReduceStock(int quantity)
    {
        if(quantity <= 0)
        {
            throw new ArgumentException("Količina za smanjenje mora biti veća od nule");
        }

        if(StockQuantity < quantity)
        {
            throw new ArgumentException($"Nedovoljna zaliha za proizvod {Name}. Na stanju: \n {StockQuantity}, traženo: {quantity}");
        }

        StockQuantity -= quantity;
    }

    public void AddStock(int quantity)
    {
        if(quantity < 0)
        {
            throw new ArgumentException("Količina za dodavanje mora biti veća od nule.");
        }
        
        StockQuantity += quantity;
    }
}
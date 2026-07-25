using InventorySystem.Application.DTOs;

namespace InventorySystem.Application.Interfaces;

public interface IProductService
{
    Task<PagedResponse<ProductResponse>> GetProductsAsync(
        string? searchTerm, 
        decimal? minPrice, 
        decimal? maxPrice, 
        int pageNumber, 
        int pageSize);

    Task<ProductResponse?> GetByIdAsync(int id);
    Task<ProductResponse> CreateAsync(ProductRequest dto);
    Task<ProductResponse?> UpdateAsync(int id, ProductRequest dto);
    Task<bool> DeleteAsync(int id);
}
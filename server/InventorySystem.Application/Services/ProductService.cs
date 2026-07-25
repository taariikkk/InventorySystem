using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using InventorySystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Application.Services;

public class ProductService : IProductService
{
    private readonly DbContext _context;

    public ProductService(DbContext context)
    {
        _context = context;
    }

    // 1. NAPREDNI UPIT: Pretraga, filtriranje i paginacija
    public async Task<PagedResponse<ProductResponse>> GetProductsAsync(
        string? searchTerm, 
        decimal? minPrice, 
        decimal? maxPrice, 
        int pageNumber, 
        int pageSize)
    {
        var query = _context.Set<Product>().AsQueryable();

        // A. Filtriranje po nazivu ili SKU šifri (Case-Insensitive)
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchLower = searchTerm.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) || 
                                     p.SKU.ToLower().Contains(searchLower));
        }

        // B. Filtriranje po rasponu cijena
        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        // C. Prebrojavanje ukupnog broja rezultata PRIJE paginacije (potrebno za PagedResponse)
        var totalCount = await query.CountAsync();

        // D. Primjena paginacije (Skip i Take) i mapiranje u DTO-ove direktno u bazi (Projection)
        var items = await query
            .OrderBy(p => p.Name) // Sortiramo abecedno po nazivu
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return new PagedResponse<ProductResponse>(items, totalCount, pageNumber, pageSize);
    }

    // 2. Pronalazak pojedinačnog proizvoda
    public async Task<ProductResponse?> GetByIdAsync(int id)
    {
        return await _context.Set<Product>()
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    // 3. Kreiranje novog proizvoda
    public async Task<ProductResponse> CreateAsync(ProductRequest dto)
    {
        var productSet = _context.Set<Product>();

        // Provjera jedinstvenosti SKU-a na nivou aplikacije (prije nego baza baci grešku)
        if (await productSet.AnyAsync(p => p.SKU == dto.SKU))
            throw new InvalidOperationException($"Proizvod sa SKU šifrom '{dto.SKU}' već postoji.");

        var product = new Product
        {
            Name = dto.Name,
            SKU = dto.SKU,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity
        };

        productSet.Add(product);
        await _context.SaveChangesAsync();

        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            SKU = product.SKU,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            CreatedAt = product.CreatedAt
        };
    }

    // 4. Izmjena postojećeg proizvoda
    public async Task<ProductResponse?> UpdateAsync(int id, ProductRequest dto)
    {
        var product = await _context.Set<Product>().FindAsync(id);
        if (product == null) return null;

        // Provjera jedinstvenosti SKU-a ako se SKU mijenja
        if (product.SKU != dto.SKU && await _context.Set<Product>().AnyAsync(p => p.SKU == dto.SKU))
            throw new InvalidOperationException($"Proizvod sa SKU šifrom '{dto.SKU}' već postoji.");

        product.Name = dto.Name;
        product.SKU = dto.SKU;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.LastModifiedAt = DateTime.UtcNow; // Audit praćenje izmjene

        await _context.SaveChangesAsync();

        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            SKU = product.SKU,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            CreatedAt = product.CreatedAt
        };
    }

    // 5. IMPLEMENTACIJA SOFT DELETE-A (Logičko brisanje)
    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Set<Product>().FindAsync(id);
        if (product == null) return false;

        // Umjesto _context.Remove(product) koja stvarno briše red iz SQL-a,
        // mi samo mijenjamo zastavicu IsDeleted u True.
        product.IsDeleted = true;
        product.LastModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
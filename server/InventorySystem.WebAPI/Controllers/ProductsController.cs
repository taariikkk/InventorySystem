using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySystem.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // SVE rute u ovom kontroleru zahtijevaju da korisnik bude logovan (ima ispravan JWT)
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // 1. GET: api/products (Dostupno svima koji su logovani - Admin, Manager, Worker)
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? searchTerm,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _productService.GetProductsAsync(searchTerm, minPrice, maxPrice, pageNumber, pageSize);
        return Ok(response);
    }

    // 2. GET: api/products/{id} (Dostupno svima logovanima)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product == null) return NotFound(new { message = "Proizvod nije pronađen." });
        return Ok(product);
    }

    // 3. POST: api/products (Samo Admin i Manager mogu kreirati proizvod)
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] ProductRequest request)
    {
        try
        {
            var product = await _productService.CreateAsync(request);
            // Vraćamo status 201 Created sa lokacijom novog resursa
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 4. PUT: api/products/{id} (Samo Admin i Manager)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductRequest request)
    {
        try
        {
            var updatedProduct = await _productService.UpdateAsync(id, request);
            if (updatedProduct == null) return NotFound(new { message = "Proizvod nije pronađen." });
            return Ok(updatedProduct);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 5. DELETE: api/products/{id} (Samo Admin i Manager)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _productService.DeleteAsync(id);
        if (!success) return NotFound(new { message = "Proizvod nije pronađen." });
        return NoContent(); // Vraćamo status 204 (No Content) za uspješno brisanje
    }
}
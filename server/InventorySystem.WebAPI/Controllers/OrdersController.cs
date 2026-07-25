using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySystem.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Sve rute za narudžbe zahtijevaju ispravan JWT token
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // 1. POST: api/orders (Kreiranje nove narudžbe)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OrderRequest request)
    {
        try
        {
            var response = await _orderService.CreateOrderAsync(request);
            // Vraćamo status 201 Created
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // Ovdje hvatamo greške o nedostatku zaliha ili nepostojećem proizvodu
            return BadRequest(new { message = ex.Message });
        }
    }

    // 2. GET: api/orders (Pregled svih narudžbi sa paginacijom)
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var response = await _orderService.GetOrdersAsync(pageNumber, pageSize);
        return Ok(response);
    }

    // 3. GET: api/orders/{id} (Detalji jedne narudžbe)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _orderService.GetOrderByIdAsync(id);
        if (response == null) return NotFound(new { message = "Narudžba nije pronađena." });
        return Ok(response);
    }
}
using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using InventorySystem.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // STROGO ZAKLjUČANO: Samo korisnik sa ulogom Admin može pristupiti bilo kojoj ruti ovdje!
public class UsersController : ControllerBase
{
    private readonly DbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UsersController(DbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    // 1. GET: api/users (Pregled svih aktivnih korisnika u sistemu)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Set<User>()
            .Where(u => !u.IsDeleted) // Ne prikazujemo obrisane
            .OrderBy(u => u.Username)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.ToString(),
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    // 2. POST: api/users (Admin kreira novog korisnika i dodjeljuje mu ulogu)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var userSet = _context.Set<User>();

        if (await userSet.AnyAsync(u => u.Email == request.Email && !u.IsDeleted))
            return BadRequest(new { message = "Korisnik sa ovim email-om već postoji." });

        if (await userSet.AnyAsync(u => u.Username == request.Username && !u.IsDeleted))
            return BadRequest(new { message = "Korisničko ime je zauzeto." });

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = request.Role
        };

        userSet.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { }, new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        });
    }

    // 3. DELETE: api/users/{id} (Admin briše korisnika iz sistema - Soft Delete)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Set<User>().FindAsync(id);
        if (user == null || user.IsDeleted) 
            return NotFound(new { message = "Korisnik nije pronađen." });

        // Bezbjednosna mjera: Admin ne smije obrisati sam sebe!
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != null && int.Parse(currentUserId) == id)
        {
            return BadRequest(new { message = "Ne možete obrisati sopstveni nalog." });
        }

        user.IsDeleted = true;
        user.LastModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
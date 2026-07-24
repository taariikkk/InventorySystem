using InventorySystem.Application.DTOs;
using InventorySystem.Application.Interfaces;
using InventorySystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly DbContext _context; // Koristićemo apstrakciju DbContext-a
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenGenerator _tokenGenerator;

    public AuthService(
        DbContext context, 
        IPasswordHasher passwordHasher, 
        ITokenGenerator tokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var usersSet = _context.Set<User>();

        // Provjera da li korisnik već postoji
        if (await usersSet.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Korisnik sa ovim email-om već postoji.");

        if (await usersSet.AnyAsync(u => u.Username == request.Username))
            throw new InvalidOperationException("Korisnik sa ovim korisničkim imenom već postoji.");

        // Hashiranje šifre i kreiranje korisnika
        var passwordHash = _passwordHasher.HashPassword(request.Password);
        
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = request.Role
        };

        usersSet.Add(user);
        await _context.SaveChangesAsync();

        // Generisanje tokena za novoregistrovanog korisnika
        var token = _tokenGenerator.GenerateToken(user);

        return new AuthResponse
        {
            Username = user.Username,
            Email = user.Email,
            Token = token,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var usersSet = _context.Set<User>();

        // Pronalazak korisnika po email-u
        var user = await usersSet.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            throw new InvalidOperationException("Pogrešan email ili lozinka.");

        // Verifikacija lozinke
        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new InvalidOperationException("Pogrešan email ili lozinka.");

        // Generisanje tokena
        var token = _tokenGenerator.GenerateToken(user);

        return new AuthResponse
        {
            Username = user.Username,
            Email = user.Email,
            Token = token,
            Role = user.Role.ToString()
        };
    }
}
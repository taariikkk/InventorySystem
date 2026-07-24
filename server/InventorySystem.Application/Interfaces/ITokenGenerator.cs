using InventorySystem.Domain.Entities;

namespace InventorySystem.Application.Interfaces;

public interface ITokenGenerator
{
    string GenerateToken(User user);
}
using InventorySystem.Domain.Common;

namespace InventorySystem.Domain.Entities;

public enum UserRole
{
    Admin,
    Manager,
    Worker
}
public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Worker;
}
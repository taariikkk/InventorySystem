using InventorySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Preuzimanje Connection String-a iz appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Registracija ApplicationDbContext-a u Dependency Injection (DI) kontejner
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, b => 
        b.MigrationsAssembly("InventorySystem.Infrastructure"))); // Migracije želimo da se čuvaju u Infrastructure projektu

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
# 1. FAZA: Build aplikacije
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

COPY *.sln .
COPY InventorySystem.Domain/*.csproj ./InventorySystem.Domain/
COPY InventorySystem.Application/*.csproj ./InventorySystem.Application/
COPY InventorySystem.Infrastructure/*.csproj ./InventorySystem.Infrastructure/
COPY InventorySystem.WebAPI/*.csproj ./InventorySystem.WebAPI/
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

# 2. FAZA: Runtime okruženje
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Render dinamički dodjeljuje port. .NET 8 sluša na 8080.
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "InventorySystem.WebAPI.dll"]
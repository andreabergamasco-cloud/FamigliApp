using Backend.Data;
using Microsoft.EntityFrameworkCore;


Console.WriteLine("=== AVVIO BACKEND ===");

try
{
    Console.WriteLine("Step 1: Creazione builder");
var builder = WebApplication.CreateBuilder(args);

Console.WriteLine("Step 2: Configurazione DB");

// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

Console.WriteLine("Step 3: Aggiunta servizi");

// builder.Services.AddControllers();

Console.WriteLine("Step 4: Build app");
var app = builder.Build();

app.MapGet("/", () => "OK");

app.Run();
}
catch (Exception ex)
{
    Console.WriteLine("=== CRASH ===");
    Console.WriteLine(ex.GetType().FullName);
    Console.WriteLine(ex.Message);
    Console.WriteLine(ex.StackTrace);
    Environment.Exit(1);
}
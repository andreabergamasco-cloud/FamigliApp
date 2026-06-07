using Backend.Data;
using Microsoft.EntityFrameworkCore;


Console.WriteLine("=== AVVIO BACKEND ===");

try
{
    Console.WriteLine("Step 1: Creazione builder");
    var builder = WebApplication.CreateBuilder(args);
    
    Console.WriteLine("Step 2: Configurazione DB");
    builder.Services.AddDbContext<Backend.Data.AppDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

    Console.WriteLine("Step 3: Aggiunta servizi");
    builder.Services.AddControllers();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
    });

    Console.WriteLine("Step 4: Build app");
    var app = builder.Build();

    Console.WriteLine("Step 5: Configurazione middleware");
    app.UseCors("Frontend");
    app.MapControllers();

    Console.WriteLine("Step 6: EnsureCreated");
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<Backend.Data.AppDbContext>();
        db.Database.EnsureCreated();
    }

    Console.WriteLine("Step 7: Avvio server");
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
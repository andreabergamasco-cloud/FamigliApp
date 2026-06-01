using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Scadenza> Scadenze => Set<Scadenza>();
    public DbSet<Spesa> Spese => Set<Spesa>();
    public DbSet<Animale> Animali => Set<Animale>();
    public DbSet<Utente> Utenti => Set<Utente>();
    public DbSet<Famiglia> Famiglie => Set<Famiglia>();
    public DbSet<Appuntamento> Appuntamenti => Set<Appuntamento>();
}
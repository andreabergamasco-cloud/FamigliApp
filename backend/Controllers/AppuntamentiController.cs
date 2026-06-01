using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppuntamentiController : ControllerBase
{
    private readonly AppDbContext _db;
    public AppuntamentiController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int idFamiglia, [FromQuery] int idUtente)
    {
        return Ok(await _db.Appuntamenti
            .Where(a => a.IdFamiglia == idFamiglia && (!a.Privato || a.IdUtente == idUtente))
            .OrderBy(a => a.Data)
            .ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id) =>
        await _db.Appuntamenti.FindAsync(id) is Appuntamento a ? Ok(a) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(Appuntamento a)
    {
        a.CreationDate = DateTime.UtcNow;
        _db.Appuntamenti.Add(a);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = a.Id }, a);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Appuntamento input)
    {
        var a = await _db.Appuntamenti.FindAsync(id);
        if (a is null) return NotFound();
        a.Titolo = input.Titolo;
        a.Descrizione = input.Descrizione;
        a.Data = input.Data;
        a.Ora = input.Ora;
        a.Tipo = input.Tipo;
        a.Colore = input.Colore;
        a.Privato = input.Privato;
        await _db.SaveChangesAsync();
        return Ok(a);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Appuntamenti.FindAsync(id);
        if (a is null) return NotFound();
        _db.Appuntamenti.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
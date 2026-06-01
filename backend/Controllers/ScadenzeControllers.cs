using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScadenzeController : ControllerBase
{
    private readonly AppDbContext _db;
    public ScadenzeController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int idFamiglia, [FromQuery] int idUtente)
    {
        var scadenze = await _db.Scadenze
            .Where(s => s.IdFamiglia == idFamiglia && (!s.Privata || s.IdUtente == idUtente))
            .OrderBy(s => s.DataScadenza)
            .ToListAsync();
        return Ok(scadenze);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id) =>
        await _db.Scadenze.FindAsync(id) is Scadenza s ? Ok(s) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(Scadenza s)
    {
        s.CreationDate = DateTime.UtcNow;
        _db.Scadenze.Add(s);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = s.Id }, s);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Scadenza input)
    {
        var s = await _db.Scadenze.FindAsync(id);
        if (s is null) return NotFound();
        s.Titolo = input.Titolo;
        s.Descrizione = input.Descrizione;
        s.DataScadenza = input.DataScadenza;
        s.Categoria = input.Categoria;
        s.Completata = input.Completata;
        s.Ricorrente = input.Ricorrente;
        s.IntervalloGiorni = input.IntervalloGiorni;
        s.Privata = input.Privata;
        await _db.SaveChangesAsync();
        return Ok(s);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await _db.Scadenze.FindAsync(id);
        if (s is null) return NotFound();
        _db.Scadenze.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
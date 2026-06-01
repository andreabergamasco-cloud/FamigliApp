using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpeseController : ControllerBase
{
    private readonly AppDbContext _db;
    public SpeseController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int idFamiglia, [FromQuery] int idUtente)
    {
        var spese = await _db.Spese
            .Where(s => s.IdFamiglia == idFamiglia && (!s.Privata || s.IdUtente == idUtente))
            .OrderByDescending(s => s.Data)
            .ToListAsync();
        return Ok(spese);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id) =>
        await _db.Spese.FindAsync(id) is Spesa s ? Ok(s) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(Spesa s)
    {
        s.CreationDate = DateTime.UtcNow;
        _db.Spese.Add(s);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = s.Id }, s);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Spesa input)
    {
        var s = await _db.Spese.FindAsync(id);
        if (s is null) return NotFound();
        s.Titolo = input.Titolo;
        s.Importo = input.Importo;
        s.Categoria = input.Categoria;
        s.Data = input.Data;
        s.Note = input.Note;
        s.Privata = input.Privata;
        await _db.SaveChangesAsync();
        return Ok(s);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await _db.Spese.FindAsync(id);
        if (s is null) return NotFound();
        _db.Spese.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnimaliController : ControllerBase
{
    private readonly AppDbContext _db;
    public AnimaliController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int idFamiglia)
    {
        return Ok(await _db.Animali
            .Where(a => a.IdFamiglia == idFamiglia)
            .OrderBy(a => a.Nome)
            .ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var a = await _db.Animali.FindAsync(id);
        return a is null ? NotFound() : Ok(a);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Animale a)
    {
        a.CreationDate = DateTime.UtcNow;
        _db.Animali.Add(a);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = a.Id }, a);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Animale input)
    {
        var a = await _db.Animali.FindAsync(id);
        if (a is null) return NotFound();
        a.Nome = input.Nome;
        a.Specie = input.Specie;
        a.Razza = input.Razza;
        a.DataNascita = input.DataNascita;
        await _db.SaveChangesAsync();
        return Ok(a);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Animali.FindAsync(id);
        if (a is null) return NotFound();
        _db.Animali.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
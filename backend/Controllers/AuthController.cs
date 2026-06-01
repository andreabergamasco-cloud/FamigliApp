using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // Crea famiglia + primo utente
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // Controlla email già esistente
        if (await _db.Utenti.AnyAsync(u => u.Email == dto.Email.ToLower()))
            return BadRequest(new { message = "Esiste già un account con questa email" });

        // Crea la famiglia
        var famiglia = new Famiglia
        {
            Cognome = dto.Cognome,
            Codice = GeneraCodice()
        };
        _db.Famiglie.Add(famiglia);
        await _db.SaveChangesAsync();

        var utente = new Utente
        {
            Nome = dto.Nome,
            Email = dto.Email.ToLower(),
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            DataNascita = dto.DataNascita,
            IdFamiglia = famiglia.Id
        };
        _db.Utenti.Add(utente);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Account creato", codiceFamiglia = famiglia.Codice });
    }

    // Unisciti a famiglia esistente tramite codice
    [HttpPost("register/join")]
    public async Task<IActionResult> RegisterJoin([FromBody] RegisterJoinDto dto)
    {
        // Controlla email già esistente
        if (await _db.Utenti.AnyAsync(u => u.Email == dto.Email.ToLower()))
            return BadRequest(new { message = "Esiste già un account con questa email" });

        // Controlla codice famiglia valido
        var famiglia = await _db.Famiglie.FirstOrDefaultAsync(f => f.Codice == dto.CodiceFamiglia.ToUpper());
        if (famiglia is null)
            return BadRequest(new { message = "Codice famiglia non valido" });

        // Controlla che non esista già un utente con stessa email in quella famiglia
        if (await _db.Utenti.AnyAsync(u => u.Email == dto.Email.ToLower() && u.IdFamiglia == famiglia.Id))
            return BadRequest(new { message = "Esiste già un account con questa email in questa famiglia" });

        var utente = new Utente
        {
            Nome = dto.Nome,
            Email = dto.Email.ToLower(),
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            DataNascita = dto.DataNascita,
            IdFamiglia = famiglia.Id
        };
        _db.Utenti.Add(utente);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Unito alla famiglia con successo" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var utente = await _db.Utenti
        .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (utente is null || !BCrypt.Net.BCrypt.Verify(dto.Password, utente.Password))
            return Unauthorized(new { message = "Email o password non corretti" });

        var token = GeneraToken(utente);

        return Ok(new {
            token,
            id = utente.Id,
            nome = utente.Nome,
            email = utente.Email,
            idFamiglia = utente.IdFamiglia,
            fotoProfilo = utente.FotoProfilo
        });
    }

    [HttpGet("famiglia/{idFamiglia}")]
    public async Task<IActionResult> GetFamiglia(int idFamiglia)
    {
        var famiglia = await _db.Famiglie.FindAsync(idFamiglia);
        if (famiglia is null) return NotFound();
        return Ok(new { cognome = famiglia.Cognome, codice = famiglia.Codice });
    }

    [HttpPost("upload-foto/{id}")]
    public async Task<IActionResult> UploadFoto(int id, IFormFile foto)
    {
        var utente = await _db.Utenti.FindAsync(id);
        if (utente is null) return NotFound();

        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(uploadsPath);

        var estensione = Path.GetExtension(foto.FileName);
        var nomeFile = $"avatar_{id}{estensione}";
        var percorso = Path.Combine(uploadsPath, nomeFile);

        using (var stream = new FileStream(percorso, FileMode.Create))
            await foto.CopyToAsync(stream);

        utente.FotoProfilo = $"/uploads/{nomeFile}";
        await _db.SaveChangesAsync();

        return Ok(new { url = utente.FotoProfilo });
    }

    [HttpPost("famiglia/crea")]
    public async Task<IActionResult> CreaFamiglia([FromBody] CreaFamigliaDto dto)
    {
        var utente = await _db.Utenti.FindAsync(dto.IdUtente);
        if (utente is null) return NotFound();

        var famiglia = new Famiglia
        {
            Cognome = dto.Cognome,
            Codice = GeneraCodice()
        };
        _db.Famiglie.Add(famiglia);
        await _db.SaveChangesAsync();

        utente.IdFamiglia = famiglia.Id;
        await _db.SaveChangesAsync();

        return Ok(new { id = famiglia.Id, cognome = famiglia.Cognome, codice = famiglia.Codice });
    }

    [HttpPost("famiglia/rigenera-codice/{idFamiglia}")]
    public async Task<IActionResult> RigeneraCodice(int idFamiglia)
    {
        var famiglia = await _db.Famiglie.FindAsync(idFamiglia);
        if (famiglia is null) return NotFound();
        famiglia.Codice = GeneraCodice();
        await _db.SaveChangesAsync();
        return Ok(new { codice = famiglia.Codice });
    }

    [HttpPost("famiglia/join")]
public async Task<IActionResult> JoinFamiglia([FromBody] JoinFamigliaDto dto)
{
    var famiglia = await _db.Famiglie.FirstOrDefaultAsync(f => f.Codice == dto.Codice);
    if (famiglia is null) return BadRequest(new { message = "Codice non valido" });
    var utente = await _db.Utenti.FindAsync(dto.IdUtente);
    if (utente is null) return NotFound();
    utente.IdFamiglia = famiglia.Id;
    await _db.SaveChangesAsync();
    return Ok(new { id = famiglia.Id, cognome = famiglia.Cognome });
}

    private string GeneraToken(Utente utente)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, utente.Id.ToString()),
            new Claim(ClaimTypes.Name, utente.Nome),
            new Claim(ClaimTypes.Email, utente.Email),
            new Claim("IdFamiglia", utente.IdFamiglia.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GeneraCodice()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }

    [HttpGet("hash/{password}")]
    public IActionResult GetHash(string password)
    {
        return Ok(new { hash = BCrypt.Net.BCrypt.HashPassword(password) });
    }
}

public record RegisterDto(string Nome, string Cognome, string Email, string Password, string DataNascita);
public record RegisterJoinDto(string Nome, string Email, string Password, string DataNascita, string CodiceFamiglia);
public record LoginDto(string Email, string Password);
public record CreaFamigliaDto(int IdUtente, string Cognome);
public record JoinFamigliaDto(int IdUtente, string Codice);
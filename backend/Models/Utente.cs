using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Utente
{
    public int Id { get; set; }
    public int IdFamiglia { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string DataNascita { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FotoProfilo { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;

    [ForeignKey("IdFamiglia")]
    public Famiglia? Famiglia { get; set; }
}
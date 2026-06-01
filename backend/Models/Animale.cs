namespace Backend.Models;

public class Animale
{
    public int Id { get; set; }
    public int IdFamiglia { get; set; }
    public int IdUtente { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Specie { get; set; } = string.Empty;
    public string? Razza { get; set; }
    public DateTime? DataNascita { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
}
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Spesa
{
    public int Id { get; set; }
    public int IdFamiglia { get; set; }
    public int IdUtente { get; set; }
    public bool Privata { get; set; } = false;
    public string Titolo { get; set; } = string.Empty;
    public decimal Importo { get; set; }
    public string Categoria { get; set; } = "altro";
    public DateTime Data { get; set; }
    public string? Note { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
}
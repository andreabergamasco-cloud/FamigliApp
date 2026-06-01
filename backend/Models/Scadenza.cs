using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Scadenza
{
    public int Id { get; set; }
    public int IdFamiglia { get; set; }
    public int IdUtente { get; set; }
    public bool Privata { get; set; } = false;
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime DataScadenza { get; set; }
    public string Categoria { get; set; } = "altro";
    public bool Completata { get; set; } = false;
    public bool Ricorrente { get; set; } = false;
    public int? IntervalloGiorni { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
}
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Appuntamento
{
    public int Id { get; set; }
    public int IdFamiglia { get; set; }
    public int IdUtente { get; set; }
    public bool Privato { get; set; } = false;
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime Data { get; set; }
    public string? Ora { get; set; }
    public string Tipo { get; set; } = "generico"; // generico, veterinario, medico, scuola, lavoro
    public string Colore { get; set; } = "#378ADD";
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
}
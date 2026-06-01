namespace Backend.Models;

public class Famiglia
{
    public int Id { get; set; }
    public string Cognome { get; set; } = string.Empty;
    public string Codice { get; set; } = string.Empty;
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
}
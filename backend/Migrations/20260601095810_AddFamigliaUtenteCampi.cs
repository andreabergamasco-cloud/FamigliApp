using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddFamigliaUtenteCampi : Migration
    {
        /// <inheritdoc />
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<int>(
        name: "IdFamiglia",
        table: "Spese",
        type: "INTEGER",
        nullable: false,
        defaultValue: 0);
    migrationBuilder.AddColumn<int>(
        name: "IdUtente",
        table: "Spese",
        type: "INTEGER",
        nullable: false,
        defaultValue: 0);
    migrationBuilder.AddColumn<bool>(
        name: "Privata",
        table: "Spese",
        type: "INTEGER",
        nullable: false,
        defaultValue: false);
    migrationBuilder.AddColumn<int>(
        name: "IdFamiglia",
        table: "Scadenze",
        type: "INTEGER",
        nullable: false,
        defaultValue: 0);
    migrationBuilder.AddColumn<int>(
        name: "IdUtente",
        table: "Scadenze",
        type: "INTEGER",
        nullable: false,
        defaultValue: 0);
    migrationBuilder.AddColumn<bool>(
        name: "Privata",
        table: "Scadenze",
        type: "INTEGER",
        nullable: false,
        defaultValue: false);
}

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FotoProfilo",
                table: "Utenti");

            migrationBuilder.DropColumn(
                name: "IdFamiglia",
                table: "Spese");

            migrationBuilder.DropColumn(
                name: "IdUtente",
                table: "Spese");

            migrationBuilder.DropColumn(
                name: "Privata",
                table: "Spese");

            migrationBuilder.DropColumn(
                name: "IdFamiglia",
                table: "Scadenze");

            migrationBuilder.DropColumn(
                name: "IdUtente",
                table: "Scadenze");

            migrationBuilder.DropColumn(
                name: "Privata",
                table: "Scadenze");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Spese",
                newName: "CreationDate");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Scadenze",
                newName: "CreationDate");
        }
    }
}

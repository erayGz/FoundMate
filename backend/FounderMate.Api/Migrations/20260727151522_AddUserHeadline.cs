using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FounderMate.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserHeadline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Headline",
                table: "Users",
                type: "TEXT",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Headline",
                table: "Users");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FounderMate.Api.Migrations
{
    /// <inheritdoc />
    public partial class ExtendApplicationEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Message",
                table: "Applications");

            migrationBuilder.AddColumn<string>(
                name: "CommitmentPreference",
                table: "Applications",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompensationPreferences",
                table: "Applications",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Contribution",
                table: "Applications",
                type: "TEXT",
                maxLength: 800,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstSprintProposal",
                table: "Applications",
                type: "TEXT",
                maxLength: 400,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Motivation",
                table: "Applications",
                type: "TEXT",
                maxLength: 600,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "Applications",
                type: "TEXT",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelectedRole",
                table: "Applications",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "Applications",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Applications",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeeklyAvailability",
                table: "Applications",
                type: "TEXT",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommitmentPreference",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "CompensationPreferences",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Contribution",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "FirstSprintProposal",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Motivation",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "SelectedRole",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "WeeklyAvailability",
                table: "Applications");

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "Applications",
                type: "TEXT",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");
        }
    }
}

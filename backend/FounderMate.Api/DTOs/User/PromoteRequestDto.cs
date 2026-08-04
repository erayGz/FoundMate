using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.User;

public class PromoteRequestDto
{
    [Required,EmailAddress]
    public string? Email { get; set; }

}
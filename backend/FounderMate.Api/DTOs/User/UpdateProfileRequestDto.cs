using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.User;

public class UpdateProfileRequestDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(200)]
    public string? Headline { get; set; }
}
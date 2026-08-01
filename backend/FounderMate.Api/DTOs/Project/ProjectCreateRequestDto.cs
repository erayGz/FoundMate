using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.Project;

public class ProjectCreateRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(50)]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public string? Category { get; set; }
}
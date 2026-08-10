using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.Project;

public class ProjectUpdateRequestDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MinLength(50)]
    [MaxLength(2000)]
    public string? Description { get; set; }

    public string? Category { get; set; }
}

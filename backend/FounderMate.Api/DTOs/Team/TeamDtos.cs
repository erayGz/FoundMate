using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.Team;

public class TeamCreateRequestDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}

public class TeamUpdateRequestDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}

public class TeamResponseDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int ProjectId { get; init; }
    public int OwnerId { get; init; }
    public DateTime CreatedAt { get; init; }
    public int MemberCount { get; init; }
}

public class TeamMemberResponseDto
{
    public int Id { get; init; }
    public int TeamId { get; init; }
    public int UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string UserEmail { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public DateTime JoinedAt { get; init; }
}

public class AddTeamMemberRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Owner|Admin|Member)$", ErrorMessage = "Role must be Owner, Admin, or Member.")]
    public string Role { get; set; } = "Member";
}

public class UpdateTeamMemberRoleRequestDto
{
    [Required]
    [RegularExpression("^(Owner|Admin|Member)$", ErrorMessage = "Role must be Owner, Admin, or Member.")]
    public string Role { get; set; } = "Member";
}
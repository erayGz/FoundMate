using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.Task;

public class TaskCreateRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Description { get; set; }

    [RegularExpression("^(Todo|InProgress|InReview|Done)$", ErrorMessage = "Status must be Todo, InProgress, InReview, or Done.")]
    public string Status { get; set; } = "Todo";

    [RegularExpression("^(Low|Medium|High|Critical)$", ErrorMessage = "Priority must be Low, Medium, High, or Critical.")]
    public string Priority { get; set; } = "Medium";

    public int? TeamId { get; set; }

    public int? AssigneeId { get; set; }

    public DateTime? DueDate { get; set; }
}

public class TaskUpdateRequestDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(5000)]
    public string? Description { get; set; }

    [RegularExpression("^(Todo|InProgress|InReview|Done)$", ErrorMessage = "Status must be Todo, InProgress, InReview, or Done.")]
    public string? Status { get; set; }

    [RegularExpression("^(Low|Medium|High|Critical)$", ErrorMessage = "Priority must be Low, Medium, High, or Critical.")]
    public string? Priority { get; set; }

    public int? TeamId { get; set; }

    public int? AssigneeId { get; set; }

    public DateTime? DueDate { get; set; }
}

public class TaskResponseDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public int ProjectId { get; init; }
    public int? TeamId { get; init; }
    public int? AssigneeId { get; init; }
    public string? AssigneeName { get; init; }
    public int ReporterId { get; init; }
    public string ReporterName { get; init; } = string.Empty;
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public int CommentCount { get; init; }
}

public class TaskCommentResponseDto
{
    public int Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public int TaskId { get; init; }
    public int AuthorId { get; init; }
    public string AuthorName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public class TaskCommentCreateRequestDto
{
    [Required]
    [MaxLength(5000)]
    public string Content { get; set; } = string.Empty;
}

public class TaskCommentUpdateRequestDto
{
    [Required]
    [MaxLength(5000)]
    public string Content { get; set; } = string.Empty;
}
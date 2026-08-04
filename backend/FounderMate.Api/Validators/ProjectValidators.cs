using FluentValidation;
using FounderMate.Api.DTOs.Project;

namespace FounderMate.Api.Validators;

public class ProjectCreateRequestValidator : AbstractValidator<ProjectCreateRequestDto>
{
    public ProjectCreateRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(50).WithMessage("Description must be at least 50 characters.")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Category));
    }
}

public class ProjectUpdateRequestValidator : AbstractValidator<ProjectUpdateRequestDto>
{
    public ProjectUpdateRequestValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters.")
            .When(x => !string.IsNullOrEmpty(x.Title));

        RuleFor(x => x.Description)
            .MinimumLength(50).WithMessage("Description must be at least 50 characters.")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Category));
    }
}
using FluentValidation;
using FounderMate.Api.DTOs.User;

namespace FounderMate.Api.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequestDto>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.Name)
            .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Name is required.")
            .When(x => x.Name != null);

        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Headline)
            .MaximumLength(200).WithMessage("Headline must not exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Headline));
    }
}
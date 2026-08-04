using FounderMate.Api.DTOs.User;
using FounderMate.Api.Models;

namespace FounderMate.Api.Helpers;

public static class MappingExtensions
{
    public static UserResponseDto ToDto(this User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Headline = user.Headline,
            CreatedAt = user.CreatedAt,
            PasswordChangedAt = user.PasswordChangedAt,
        };
    }
}

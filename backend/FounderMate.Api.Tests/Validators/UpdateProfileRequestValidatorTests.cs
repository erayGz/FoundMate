using FounderMate.Api.DTOs.User;
using FounderMate.Api.Validators;
using Xunit;

namespace FounderMate.Api.Tests;

public class UpdateProfileRequestValidatorTests
{
    private readonly UpdateProfileRequestValidator _validator = new();

    [Fact]
    public void BlankName_ShouldFail()
    {
        var result = _validator.Validate(new UpdateProfileRequestDto { Name = "   " });
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateProfileRequestDto.Name));
    }

    [Fact]
    public void OmittedName_ShouldPass()
    {
        var result = _validator.Validate(new UpdateProfileRequestDto { Headline = "Yeni başlık" });
        Assert.True(result.IsValid);
    }

    [Fact]
    public void OverLengthName_ShouldFail()
    {
        var result = _validator.Validate(new UpdateProfileRequestDto { Name = new string('n', 101) });
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateProfileRequestDto.Name));
    }

    [Fact]
    public void OverLengthHeadline_ShouldFail()
    {
        var result = _validator.Validate(new UpdateProfileRequestDto { Headline = new string('h', 201) });
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateProfileRequestDto.Headline));
    }

    [Fact]
    public void HeadlineAtMaxLength_ShouldPass()
    {
        var result = _validator.Validate(new UpdateProfileRequestDto { Headline = new string('h', 200) });
        Assert.True(result.IsValid);
    }

    [Fact]
    public void ValidProfile_ShouldPass()
    {
        var result = _validator.Validate(new UpdateProfileRequestDto { Name = "Deniz Yılmaz", Headline = "Frontend geliştirici" });
        Assert.True(result.IsValid);
    }
}
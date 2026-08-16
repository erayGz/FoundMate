using FounderMate.Api.DTOs.Application;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;

namespace FounderMate.Api.Tests;

public class ApplicationServiceTests : TestBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationServiceTests()
    {
        _applicationService = new ApplicationService(Context, Mock.Of<ILogger<ApplicationService>>());
    }

    private static ApplicationUpsertRequestDto ValidRequest(string status = "Draft")
    {
        return new ApplicationUpsertRequestDto
        {
            SelectedRole = "Frontend",
            Motivation = "Bu projeye gerçekten ilgi duyuyorum ve katkı sağlamak istiyorum. Uzun bir motivasyon metni yazıyorum.",
            Contribution = "React ve TypeScript deneyimimle frontend tarafında etkin katkı sağlayabilirim. Ayrıca kullanıcı deneyimi üzerine çalışabilirim.",
            FirstSprintProposal = "İlk sprintte ana akışı prototipleyip kullanılabilirlik testi yapmayı öneriyorum.",
            WeeklyAvailability = "6–8 saat",
            CommitmentPreference = "trial-sprint",
            CompensationPreferences = new List<string> { "open-to-discussion" },
            PortfolioUrl = "https://github.com/test",
            Status = status
        };
    }

    [Fact]
    public async Task CreateAsync_WithValidDraft_ShouldCreateDraftApplication()
    {
        // Arrange
        var owner = CreateTestUser("appowner@example.com", "App Owner");
        var applicant = CreateTestUser("applicant@example.com", "Applicant");
        var project = CreateTestProject(owner.Id, "Application Target");

        // Act
        var result = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Draft"));

        // Assert
        result.Should().NotBeNull();
        result.ProjectId.Should().Be(project.Id);
        result.ApplicantId.Should().Be(applicant.Id);
        result.Status.Should().Be("Draft");
        result.SelectedRole.Should().Be("Frontend");
        result.CompensationPreferences.Should().Contain("open-to-discussion");
        result.SubmittedAt.Should().BeNull();

        var inDb = await Context.Applications.FirstOrDefaultAsync(a => a.Id == result.Id);
        inDb.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAsync_WithPendingStatus_ShouldSetSubmittedAt()
    {
        // Arrange
        var owner = CreateTestUser("appowner2@example.com", "App Owner 2");
        var applicant = CreateTestUser("applicant2@example.com", "Applicant 2");
        var project = CreateTestProject(owner.Id, "Application Target 2");

        // Act
        var result = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Assert
        result.Status.Should().Be("Pending");
        result.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAsync_ByProjectOwner_ShouldThrow()
    {
        // Arrange
        var owner = CreateTestUser("owny@example.com", "Owny");
        var project = CreateTestProject(owner.Id, "Owner Project");

        // Act
        Func<Task> act = () => _applicationService.CreateAsync(owner.Id, project.Id, ValidRequest());

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task CreateAsync_DuplicateActiveApplication_ShouldThrow()
    {
        // Arrange
        var owner = CreateTestUser("dupeowner@example.com", "Dupe Owner");
        var applicant = CreateTestUser("dupeapplicant@example.com", "Dupe Applicant");
        var project = CreateTestProject(owner.Id, "Dupe Project");

        await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());

        // Act
        Func<Task> act = () => _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task CreateAsync_AfterWithdrawal_ShouldReopenApplication()
    {
        // Arrange
        var owner = CreateTestUser("reopenowner@example.com", "Reopen Owner");
        var applicant = CreateTestUser("reopenapplicant@example.com", "Reopen Applicant");
        var project = CreateTestProject(owner.Id, "Reopen Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());
        await _applicationService.WithdrawAsync(applicant.Id, created.Id);

        // Act
        var reopened = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Assert
        reopened.Should().NotBeNull();
        reopened.Id.Should().Be(created.Id);
        reopened.Status.Should().Be("Pending");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentProject_ShouldThrow()
    {
        // Arrange
        var applicant = CreateTestUser("ghost@example.com", "Ghost");

        // Act
        Func<Task> act = () => _applicationService.CreateAsync(applicant.Id, 99999, ValidRequest());

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_ByApplicant_ShouldUpdateApplication()
    {
        // Arrange
        var owner = CreateTestUser("updateowner@example.com", "Update Owner");
        var applicant = CreateTestUser("updateapplicant@example.com", "Update Applicant");
        var project = CreateTestProject(owner.Id, "Update Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Draft"));

        var request = ValidRequest("Pending");
        request.SelectedRole = "Backend";

        // Act
        var result = await _applicationService.UpdateAsync(applicant.Id, created.Id, request);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be("Pending");
        result.SelectedRole.Should().Be("Backend");
        result.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_ByNonApplicant_ShouldReturnNull()
    {
        // Arrange
        var owner = CreateTestUser("stolenowner@example.com", "Stolen Owner");
        var applicant = CreateTestUser("stolenapplicant@example.com", "Stolen Applicant");
        var intruder = CreateTestUser("stolenintruder@example.com", "Stolen Intruder");
        var project = CreateTestProject(owner.Id, "Stolen Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());

        // Act
        var result = await _applicationService.UpdateAsync(intruder.Id, created.Id, ValidRequest("Pending"));

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_AfterReviewed_ShouldThrow()
    {
        // Arrange
        var owner = CreateTestUser("lockedowner@example.com", "Locked Owner");
        var applicant = CreateTestUser("lockedapplicant@example.com", "Locked Applicant");
        var project = CreateTestProject(owner.Id, "Locked Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));
        await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Accepted");

        // Act
        Func<Task> act = () => _applicationService.UpdateAsync(applicant.Id, created.Id, ValidRequest("Pending"));

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetByProjectAsync_ByOwner_ShouldReturnApplications()
    {
        // Arrange
        var owner = CreateTestUser("listowner@example.com", "List Owner");
        var applicant = CreateTestUser("listapplicant@example.com", "List Applicant");
        var project = CreateTestProject(owner.Id, "List Project");
        await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());

        // Act
        var result = await _applicationService.GetByProjectAsync(owner.Id, project.Id);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().ApplicantId.Should().Be(applicant.Id);
    }

    [Fact]
    public async Task GetByProjectAsync_ByNonOwner_ShouldThrow()
    {
        // Arrange
        var owner = CreateTestUser("secretowner@example.com", "Secret Owner");
        var outsider = CreateTestUser("outsider@example.com", "Outsider");
        var project = CreateTestProject(owner.Id, "Secret Project");

        // Act
        Func<Task> act = () => _applicationService.GetByProjectAsync(outsider.Id, project.Id);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task GetMineAsync_ShouldReturnOnlyApplicantsApplications()
    {
        // Arrange
        var owner = CreateTestUser("mineowner@example.com", "Mine Owner");
        var applicant = CreateTestUser("mineapplicant@example.com", "Mine Applicant");
        var other = CreateTestUser("mineother@example.com", "Mine Other");
        var p1 = CreateTestProject(owner.Id, "Mine Project 1");
        var p2 = CreateTestProject(owner.Id, "Mine Project 2");
        await _applicationService.CreateAsync(applicant.Id, p1.Id, ValidRequest());
        await _applicationService.CreateAsync(other.Id, p2.Id, ValidRequest());

        // Act
        var result = await _applicationService.GetMineAsync(applicant.Id);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().ProjectId.Should().Be(p1.Id);
    }

    [Fact]
    public async Task UpdateStatusAsync_ByOwner_ShouldUpdateAndReview()
    {
        // Arrange
        var owner = CreateTestUser("acceptowner@example.com", "Accept Owner");
        var applicant = CreateTestUser("acceptapplicant@example.com", "Accept Applicant");
        var project = CreateTestProject(owner.Id, "Accept Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Act
        var result = await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Accepted");

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be("Accepted");
        result.ReviewedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task AcceptAsync_ShouldAddApplicantAsProjectMember()
    {
        // Arrange
        var owner = CreateTestUser("memberacceptowner@example.com", "Member Accept Owner");
        var applicant = CreateTestUser("memberacceptapplicant@example.com", "Member Accept Applicant");
        var project = CreateTestProject(owner.Id, "Member Accept Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Act
        await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Accepted");

        // Assert
        var member = await Context.ProjectMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.ProjectId == project.Id && m.UserId == applicant.Id);
        member.Should().NotBeNull();
        member!.JoinedAt.Should().NotBe(default);
        member.User!.Name.Should().Be(applicant.Name);
    }

    [Fact]
    public async Task AcceptAsync_WhenUserReappliesAfterWithdrawal_ShouldAddSingleMember()
    {
        // Arrange
        var owner = CreateTestUser("reapplyowner@example.com", "Reapply Owner");
        var applicant = CreateTestUser("reapplyapplicant@example.com", "Reapply Applicant");
        var project = CreateTestProject(owner.Id, "Reapply Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));
        await _applicationService.WithdrawAsync(applicant.Id, created.Id);
        await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Act
        await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Accepted");

        // Assert
        var members = await Context.ProjectMembers
            .Where(m => m.ProjectId == project.Id && m.UserId == applicant.Id)
            .ToListAsync();
        members.Should().HaveCount(1);
        members.Single().JoinedAt.Should().NotBe(default);
    }

    [Fact]
    public async Task RejectAsync_ShouldNotCreateProjectMember()
    {
        // Arrange
        var owner = CreateTestUser("rejectmemberowner@example.com", "Reject Member Owner");
        var applicant = CreateTestUser("rejectmemberapplicant@example.com", "Reject Member Applicant");
        var project = CreateTestProject(owner.Id, "Reject Member Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Act
        await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Rejected");

        // Assert
        var member = await Context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == project.Id && m.UserId == applicant.Id);
        member.Should().BeNull();
        var inDb = await Context.Applications.FindAsync(created.Id);
        inDb!.Status.Should().Be("Rejected");
    }

    [Fact]
    public async Task UpdateStatusAsync_ByNonOwner_ShouldReturnNull()
    {
        // Arrange
        var owner = CreateTestUser("statusowner@example.com", "Status Owner");
        var applicant = CreateTestUser("statusapplicant@example.com", "Status Applicant");
        var intruder = CreateTestUser("intruder@example.com", "Intruder");
        var project = CreateTestProject(owner.Id, "Status Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Act
        var result = await _applicationService.UpdateStatusAsync(intruder.Id, created.Id, "Accepted");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateStatusAsync_AlreadyReviewed_ShouldThrow()
    {
        // Arrange
        var owner = CreateTestUser("twiceowner@example.com", "Twice Owner");
        var applicant = CreateTestUser("twiceapplicant@example.com", "Twice Applicant");
        var project = CreateTestProject(owner.Id, "Twice Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));
        await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Rejected");

        // Act
        Func<Task> act = () => _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Accepted");

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task WithdrawAsync_ByApplicant_ShouldSetWithdrawn()
    {
        // Arrange
        var owner = CreateTestUser("withdrawowner@example.com", "Withdraw Owner");
        var applicant = CreateTestUser("withdrawapplicant@example.com", "Withdraw Applicant");
        var project = CreateTestProject(owner.Id, "Withdraw Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));

        // Act
        var result = await _applicationService.WithdrawAsync(applicant.Id, created.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be("Withdrawn");

        var inDb = await Context.Applications.FindAsync(created.Id);
        inDb.Should().NotBeNull();
        inDb!.Status.Should().Be("Withdrawn");
    }

    [Fact]
    public async Task WithdrawAsync_AfterReviewed_ShouldThrow()
    {
        // Arrange
        var owner = CreateTestUser("reviewedwithdrawowner@example.com", "Reviewed Withdraw Owner");
        var applicant = CreateTestUser("reviewedwithdrawapplicant@example.com", "Reviewed Withdraw Applicant");
        var project = CreateTestProject(owner.Id, "Reviewed Withdraw Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest("Pending"));
        await _applicationService.UpdateStatusAsync(owner.Id, created.Id, "Accepted");

        // Act
        Func<Task> act = () => _applicationService.WithdrawAsync(applicant.Id, created.Id);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task DeleteAsync_ByApplicant_ShouldDeleteApplication()
    {
        // Arrange
        var owner = CreateTestUser("deleteowner@example.com", "Delete Owner");
        var applicant = CreateTestUser("deleteapplicant@example.com", "Delete Applicant");
        var project = CreateTestProject(owner.Id, "Delete Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());

        // Act
        var result = await _applicationService.DeleteAsync(applicant.Id, created.Id);

        // Assert
        result.Should().BeTrue();
        var inDb = await Context.Applications.FindAsync(created.Id);
        inDb.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ByNonApplicant_ShouldReturnFalse()
    {
        // Arrange
        var owner = CreateTestUser("nodeleteowner@example.com", "No Delete Owner");
        var applicant = CreateTestUser("nodeleteapplicant@example.com", "No Delete Applicant");
        var intruder = CreateTestUser("nodeleteintruder@example.com", "No Delete Intruder");
        var project = CreateTestProject(owner.Id, "No Delete Project");
        var created = await _applicationService.CreateAsync(applicant.Id, project.Id, ValidRequest());

        // Act
        var result = await _applicationService.DeleteAsync(intruder.Id, created.Id);

        // Assert
        result.Should().BeFalse();
        var inDb = await Context.Applications.FindAsync(created.Id);
        inDb.Should().NotBeNull();
    }
}
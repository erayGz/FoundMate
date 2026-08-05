using FounderMate.Api.DTOs.Common;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;

    public UploadController(IFileUploadService fileUploadService)
    {
        _fileUploadService = fileUploadService;
    }

    [HttpPost("image")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromForm] string? subFolder = "")
    {
        if (!_fileUploadService.IsValidFile(file, out var error))
        {
            return BadRequest(new { message = error });
        }

        var url = await _fileUploadService.UploadAsync(file, subFolder);
        if (url is null)
        {
            return BadRequest(new { message = "Upload failed." });
        }

        return Ok(new UploadResponse { Url = url });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { message = "URL is required." });
        }

        var deleted = await _fileUploadService.DeleteAsync(url);
        return deleted ? Ok(new { message = "File deleted." }) : NotFound(new { message = "File not found." });
    }
}

public class UploadResponse
{
    public string Url { get; init; } = string.Empty;
}
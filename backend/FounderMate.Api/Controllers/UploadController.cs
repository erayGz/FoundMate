using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[SwaggerTag("Upload - File upload and management")]
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
    [SwaggerOperation(Summary = "Upload image", Description = "Uploads an image file. Validates file type (jpg, png, gif, webp) and size (max 5MB). Returns the file URL.")]
    public async Task<IActionResult> UploadImage(
        [SwaggerParameter("Image file to upload")] IFormFile file,
        [FromForm][SwaggerParameter("Optional subfolder path")] string? subFolder = "")
    {
        if (!_fileUploadService.IsValidFile(file, out var error))
        {
            return BadRequest(new { message = error });
        }

        var url = await _fileUploadService.UploadAsync(file, subFolder ?? string.Empty);
        if (url is null)
        {
            return BadRequest(new { message = "Upload failed." });
        }

        return Ok(new UploadResponse { Url = url });
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Delete uploaded file", Description = "Deletes a previously uploaded file by its URL.")]
    public async Task<IActionResult> Delete([FromQuery][SwaggerParameter("Full URL of the file to delete")] string url)
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
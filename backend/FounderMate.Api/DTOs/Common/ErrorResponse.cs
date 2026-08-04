namespace FounderMate.Api.DTOs.Common;

public class ErrorResponse
{
    public int StatusCode { get; init; }
    public string Message { get; init; } = string.Empty;
    public object? Errors { get; init; }
    public string TraceId { get; init; } = string.Empty;
}
namespace FounderMate.Api.Helpers;

/// <summary>
/// Signals a request that conflicts with the current state of a resource
/// (for example, registering with an email that already exists). Mapped to HTTP 409.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
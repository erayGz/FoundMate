namespace FounderMate.Api.Config;

public class AiSettings
{
    public const string SectionName = "Ai";
    public string Provider { get; set; } = "OpenAI"; // OpenAI, AzureOpenAI
    public string ApiKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty; // For Azure OpenAI
    public string DeploymentName { get; set; } = "gpt-4o-mini"; // Model deployment name
    public string Model { get; set; } = "gpt-4o-mini"; // Model name
    public int MaxTokens { get; set; } = 2000;
    public float Temperature { get; set; } = 0.7f;
    public bool Enabled { get; set; } = true;
}
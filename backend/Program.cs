using PatternLab.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IContentService, ContentService>();
builder.Services.AddSingleton<IProgressService, ProgressService>();

var configuredOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? Array.Empty<string>();
var envOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS");
var extraOrigins = string.IsNullOrWhiteSpace(envOrigins)
    ? Array.Empty<string>()
    : envOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

var corsOrigins = configuredOrigins
    .Concat(extraOrigins)
    .Concat(new[]
    {
        "http://localhost:4327",
        "http://127.0.0.1:4327",
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    })
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("frontend");

var wwwroot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (Directory.Exists(wwwroot))
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", product = "PatternLab" }));

if (Directory.Exists(wwwroot))
{
    app.MapFallbackToFile("index.html");
}

app.Run();

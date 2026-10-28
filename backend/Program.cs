using PatternLab.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IContentService, ContentService>();
builder.Services.AddSingleton<IProgressService, ProgressService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(
                "http://localhost:4327",
                "http://127.0.0.1:4327",
                "http://localhost:4200",
                "http://127.0.0.1:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("frontend");
app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", product = "PatternLab" }));

app.Run();

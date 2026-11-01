# PatternLab — single container: Angular SPA + ASP.NET Core API
FROM node:22-bookworm AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend
WORKDIR /src/backend
COPY backend/*.csproj ./
RUN dotnet restore
COPY backend/ ./
COPY --from=frontend /src/frontend/dist/frontend/browser ./wwwroot
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=backend /app/publish ./
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
CMD ["dotnet", "PatternLab.Api.dll"]

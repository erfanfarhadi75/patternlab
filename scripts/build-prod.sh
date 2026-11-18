#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${HOME}/.dotnet:${PATH}"

cd "${ROOT}/frontend"
npm ci
npm run build

rm -rf "${ROOT}/backend/wwwroot"
mkdir -p "${ROOT}/backend/wwwroot"
cp -a "${ROOT}/frontend/dist/frontend/browser/." "${ROOT}/backend/wwwroot/"

cd "${ROOT}/backend"
dotnet publish -c Release -o "${ROOT}/artifacts/publish"
echo "Published to ${ROOT}/artifacts/publish"

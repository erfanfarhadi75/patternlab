# PatternLab

Interactive design patterns learning platform (Phase 1 MVP).

**Brand:** PatternLab  
**Stack:** Angular 22 frontend + ASP.NET Core 9 (C#) Web API  
**Languages:** English + فارسی with real `dir=rtl|ltr`  
**Patterns:** Factory Method (Creational), Adapter (Structural), Observer (Behavioral)

Teaching structure is inspired conceptually by catalogs such as [Refactoring.Guru design patterns](https://refactoring.guru/design-patterns). All lesson copy, diagrams ideas, and TypeScript examples in this repo are original — nothing is copied from that site.

## Layout

```
frontend/   Angular 22 app (UI, i18n, local settings)
backend/    ASP.NET Core Web API (pattern content + progress/XP)
```

## Run locally

### API (port 5287)

```bash
export PATH="$HOME/.dotnet:$PATH"   # if needed
cd backend
dotnet run --launch-profile http
```

Health check: `http://127.0.0.1:5287/api/health`

### Frontend (port 4327)

```bash
cd frontend
npm install
npm start
```

App: [http://127.0.0.1:4327](http://127.0.0.1:4327)

## What works in Phase 1

- Dashboard, Pattern Explorer (search/filter), Pattern Detail (Learn + Quiz), Practice Arena, Progress & Achievements, Settings
- FA/EN UI + lesson content; code blocks always LTR monospace
- Junior / Mid / Senior change explanation depth and exercises
- XP for first correct answers and lesson completion; user level; non-punitive streak; unlockable advanced Observer challenge
- Settings in `localStorage`; progress persisted by the API as JSON under `backend/Data/`

## Deferred (Phase 2+)

Code / Refactoring / Visual / Compare modes, remaining GoF patterns, multi-language code samples, accounts sync.

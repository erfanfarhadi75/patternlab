# PatternLab

Interactive design patterns learning platform with a playable Practice Arena.

**Brand:** PatternLab  
**Stack:** Angular 22 frontend + ASP.NET Core 9 (C#) Web API  
**Languages:** English + فارسی with real `dir=rtl|ltr`  
**Patterns:** Factory Method (Creational), Adapter (Structural), Observer (Behavioral)

Teaching structure is inspired conceptually by catalogs such as [Refactoring.Guru design patterns](https://refactoring.guru/design-patterns). All lesson copy, diagram ideas, and TypeScript examples in this repo are original — nothing is copied from that site.

## Layout

```
frontend/   Angular 22 app (UI, i18n, arena playground, local settings)
backend/    ASP.NET Core Web API (pattern content + progress/XP + arena clears)
```

## Run locally

### API (port 5287)

```bash
export PATH="$HOME/.dotnet:$PATH"   # if needed
cd backend
ASPNETCORE_URLS=http://127.0.0.1:5287 dotnet run
```

Health check: `http://127.0.0.1:5287/api/health`

### Frontend (port 4327)

```bash
cd frontend
npm install
npm start
```

App: [http://127.0.0.1:4327](http://127.0.0.1:4327)  
Arena: [http://127.0.0.1:4327/practice?pattern=factory-method&mode=blocks](http://127.0.0.1:4327/practice?pattern=factory-method&mode=blocks)

## Phase 2 — Practice Arena

Hands-on **Pattern Playground** (professional developer toy, not cartoon UI):

1. **Blocks** — place Creator/Product/Adapter/Subject roles on a canvas, wire relations, validate structure, step through runtime flow animation (Factory create, Adapter wrap, Observer notify chain).
2. **Code** — fill TypeScript blanks; client grades; XP via API.
3. **Refactor** — pick moves that apply the pattern to a design smell; quality score.
4. Existing **Learn / Quiz** remain; Dashboard hero CTA is **Play this pattern**.

Arena clears persist through `POST /api/progress/{userId}/arena/complete` (first clear awards XP).

## Also in the product

- Dashboard, Pattern Explorer, Pattern Detail (Learn + Quiz), Progress & Achievements, Settings
- FA/EN UI + lesson content; code blocks always LTR monospace
- Junior / Mid / Senior change explanation depth and exercises
- XP, user level, non-punitive streak; unlockable advanced Observer challenge
- Settings in `localStorage`; progress JSON under `backend/Data/`

## Later

Compare Patterns depth, remaining GoF patterns, multi-language code samples, accounts sync.

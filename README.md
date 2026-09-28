# TelaLogin — UESC Acesso

Aplicação **Angular 19** + **Spring Boot 3** com autenticação JWT.

Fluxo: o usuário informa e-mail e senha → o Angular chama `POST /auth/login` → o Spring valida as credenciais (BCrypt), gera um **Access Token** (JWT) → as requisições protegidas usam `Authorization: Bearer <token>` (a senha **não** é reenviada).

## Credenciais de demonstração

| Campo | Valor |
|-------|--------|
| E-mail | `aluno@uesc.br` |
| Senha | `senha123` |

## Pré-requisitos

- Node.js 18+ e npm
- Java 17+ e Maven
- (E2E) Chromium do Playwright: `npx playwright install chromium`

## Backend (Spring)

```bash
cd backend
mvn spring-boot:run
```

API em `http://localhost:8080`.

| Método | Rota | Acesso | Detalhe |
|--------|------|--------|---------|
| `POST` | `/auth/login` | Público | Body `{ "email", "senha" }` → `{ "accessToken", "tokenType": "Bearer", "expiresIn" }` ou **401** |
| `POST` | `/auth/register` | Público | Body `{ "email", "senha" }` → **201** `{ "email", "message" }`, **409** se e-mail já existe |
| `GET` | `/api/me` | JWT | Header `Authorization: Bearer …` → `{ "email" }` |

Configuração JWT: `backend/src/main/resources/application.properties` (`jwt.secret`, `jwt.expiration-seconds`). O secret atual é só para desenvolvimento.

## Frontend (Angular)

```bash
npm install
ng serve
```

Abra `http://localhost:4200/`.

- `/login` — formulário (branding UESC / brasão)
- `/register` — criar conta (persiste em memória no backend enquanto a API estiver no ar)
- `/forgot-password` — simulação de recuperação de senha
- `/home` — área autenticada; chama `GET /api/me` com o token em `sessionStorage`

## Testes

Com a API em `:8080` e o Angular em `:4200` (necessário para o E2E):

```bash
# Backend — JUnit / MockMvc
npm run test:backend

# Frontend — Karma / Jasmine (Chrome headless)
npm run test

# End-to-end — Playwright
npx playwright install chromium
npm run test:e2e
```

O E2E cobre: guard sem token, login inválido, login válido com Bearer em `/api/me`, e logout.

## Estrutura

```text
backend/          Spring Boot + Security + JWT (Nimbus)
src/app/core/     AuthService, interceptor, guard, token storage
src/app/login/    Tela de login
src/app/home/     Área autenticada
e2e/              Testes Playwright
public/           Brasão UESC e assets estáticos
```

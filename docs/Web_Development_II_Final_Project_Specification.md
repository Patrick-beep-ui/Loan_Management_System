# Final Capstone Specification: Contract-First REST APIs & DevSecOps Pipeline

**DEPARTMENT OF SOFTWARE ENGINEERING • FALL 2026**  
**COP3851: Web Development II**  
**BLOOM LEVEL 6: CREATE**

## 1.0 COURSE OVERVIEW & ARCHITECTURAL MANDATE

Students must construct a secure full-stack web application designed for complex community operations. Development follows strict Contract-First API Architecture: database schemas (3NF) and OpenAPI specs must be committed before AI agents generate controller endpoints.

> **Contract-First Constraint:** AI coding agents are restricted from generating backend endpoints without a pre-existing OpenAPI contract. All database queries must bind parameters to eliminate injection vectors.

## 2.0 TECHNICAL REQUIREMENTS & STACK STANDARDS

- **Database Systems:** Relational Database (PostgreSQL/SQLite) normalized to 3rd Normal Form (3NF) with explicit foreign keys.
- **API Architecture:** RESTful endpoints adhering to HTTP specs, parameterized queries, and middleware pipelines.
- **Auth & Security:** Secure Session/JWT handling, Argon2/BCrypt password hashing, and HttpOnly cookies.

## 3.0 CONTEXT ARCHITECTURE & SYSTEM CONSTITUTION

Repositories must contain a root CLAUDE.md or GEMINI.md enforcing backend governance:

```markdown
# Full-Stack System Constitution (CLAUDE.md / GEMINI.md)

1. CONTRACT COMPLIANCE: Endpoints MUST strictly match signatures in `docs/openapi.json`.
2. BOLA PREVENTION: Middleware MUST enforce row-level access control (`WHERE tenant_id = current_user`).
3. DATABASE RULES: NO dynamic SQL strings. Use parameterized queries or ORM bindings exclusively.
4. COOKIE SECURITY: Auth tokens MUST be set with `HttpOnly; Secure; SameSite=Strict`.
```

## 4.0 ADVERSARIAL AI RED-TEAM SECURITY AUDIT

> **Full-Stack API Penetration Test:** Prior to submission, an AI Red-Team Agent will attempt BOLA/IDOR object harvesting, SQL/NoSQL injection, CORS credential leaks, and rate-limit bypasses against the student's running API.

- **Access Control:** Mandatory row-level authorization middleware on all data modification operations.
- **CORS & Headers:** Explicit CORS domain origin lock (no wildcard *) and Security Headers.

## 5.0 DEPENDENCY GOVERNANCE (THE RFC PROTOCOL)

AI suggestions for backend npm/NuGet packages require a formal [DEPENDENCY RFC] detailing CVE audits (via npm audit) and justification against writing custom middleware.

## 6.0 EVALUATION & GRADING MATRIX

| Assessment Criteria | Weight | Performance Standard (Bloom's Level 5 & 6) |
| --- | --- | --- |
| API Contract & 3NF Relational Schema | 25% | Fully validated OpenAPI spec, 3NF normalized schema, atomic migration scripts. |
| Full-Stack Architecture & Middleware | 20% | Clean RESTful routes, error middleware, transactional database execution. |
| API Security & BOLA Red-Team Audit | 25% | Documented prevention of OWASP Top 10 API threats verified by AI Red-Team exploit logs. |
| Functional Community Solution | 20% | Runnable full-stack service handling real-world community transactions reliably. |
| Live Defense & API Extension | 10% | Ability to implement new middleware authorization rules live on a whiteboard. |

---

Department of Software Engineering — COP3851 Web Development II (Fall 2026)  
Page 1 of 1

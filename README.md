# Pich Chamroeun Pharmacy Management System

Project foundation: Express 5 API (`backend/`), Next.js 16 App Router (`frontend/`), MinIO object storage, and Nginx reverse proxy. Node.js 22 and npm are used in both applications. No database or pharmacy business features are included yet.

## Development with Docker

Requires Docker Engine and Docker Compose v2 or newer.

```sh
cp .env.example .env
# Change the local credentials if needed.
docker compose up --build -d
docker compose ps
```

- Application: http://localhost:8080
- API health: http://localhost:8080/api/health
- API information: http://localhost:8080/api
- MinIO S3 API: http://localhost:9000
- MinIO console: http://localhost:9001 (use credentials from `.env`)

Nginx routes `/api` and `/api/*` to Express and other requests to Next.js, including development WebSocket upgrades. App source folders are mounted for live reload. Rebuild after changing dependencies or configuration files. Express and Next.js have no host ports; use Nginx to access them.

```sh
docker compose logs -f
docker compose down
```

MinIO data persists in a named volume. `docker compose down -v` **deletes stored files**.

## Production

Use the production file on its own, with a separate environment file:

```sh
cp .env.production.example .env.production
# Replace both MinIO credential placeholders with unique production values.
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

The production configuration provides multi-stage builds, Next.js standalone output, non-root application containers, health checks, automatic restarts, bounded logs, and no source mounts. Only Nginx has a published port; MinIO stays on the Docker network. Development and production use different Compose project names and therefore separate data volumes.

The default HTTP listener binds to `127.0.0.1:8080`. Put a TLS-terminating proxy in front of it before public deployment. If your TLS proxy runs on another host or container network, set `HTTP_BIND` appropriately and restrict access to the HTTP port. The included Nginx configuration serves HTTP; certificates are deployment-specific. Configure DNS for `www.pichchamroeun.com` to reach your TLS proxy and preserve the original `Host` header when forwarding to Nginx.

Production Nginx (`nginx/default.conf`) serves the app for `www.pichchamroeun.com`. Requests using a server IP, the bare domain, or another hostname receive a permanent HTTP 308 redirect to `https://www.pichchamroeun.com`, preserving the path and query string. `/healthz` stays available without a redirect for container health checks. Development uses `nginx/development.conf` so localhost and local IP access continue to work. HTTPS must terminate at your TLS proxy; an HTTPS request to an IP needs a successful TLS handshake before any HTTP redirect can occur.

After changing Nginx configuration on a running production stack:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec nginx nginx -t
docker compose --env-file .env.production -f docker-compose.prod.yml exec nginx nginx -s reload
```

MinIO community source is archived upstream: https://github.com/minio/minio. Its image is built locally from pinned release `RELEASE.2025-10-15T17-29-55Z` rather than depending on discontinued prebuilt images. The first build needs access to Go modules and can take several minutes. Review upstream maintenance and security status before relying on this storage for production. Preserve its AGPL license obligations. `minio/Dockerfile` accepts `MINIO_VERSION` as a build argument for an explicitly reviewed source revision.

Create the `pharmacy` bucket and a scoped application access key through your storage administration workflow before adding upload features. Set `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in the root environment file; the API container receives them. Root credentials are used only by MinIO. The starter does not create buckets, implement uploads, or expose unauthenticated storage endpoints. Back up the MinIO volume and store production secrets outside version control.

## Run applications without Docker

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm ci --prefix backend
npm ci --prefix frontend
npm run dev --prefix backend
# In a second terminal:
npm run dev --prefix frontend
```

Visit http://localhost:3000. Next.js rewrites `/api/*` to the local API on port 4000. For storage outside Docker, change `backend/.env` to `MINIO_ENDPOINT=127.0.0.1`. Docker uses the root `.env` and service environment declarations, not the two application `.env` files.

## Checks

```sh
npm test --prefix backend
npm run build --prefix frontend
docker compose config --quiet
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
```

Lockfiles are committed for reproducible npm installs. Rebuild images when updating dependencies or base images. To test the full production path, start the production stack, request `/`, `/api/health`, and check all services with `docker compose ... ps`.

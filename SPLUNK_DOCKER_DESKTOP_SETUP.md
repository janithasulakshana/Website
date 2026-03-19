# Splunk Logging Setup (Docker Desktop)

This project can forward container logs to Splunk using a Docker Compose override file.

## Files Added

- `docker-compose.splunk.yml`: enables Splunk logging driver for `backend`, `frontend`, `prometheus`, and `grafana`.
- `.env.docker.example`: includes required Splunk HEC variables.

## 1) Prepare environment file

In PowerShell from project root:

```powershell
cd "C:\Users\kanishka\Desktop\github projects\Website"
Copy-Item .env.docker.example .env.docker
```

Edit `.env.docker` and set:

- `SPLUNK_HEC_URL` (HEC endpoint, usually port `8088`)
- `SPLUNK_HEC_TOKEN`
- `SPLUNK_INDEX` (default `main`)
- `SPLUNK_INSECURE_SKIP_VERIFY` (`false` for valid certs; `true` only for testing)

## 2) Start stack with Splunk logging enabled

```powershell
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.splunk.yml up -d --build
```

## 3) Verify containers are healthy

```powershell
docker compose -f docker-compose.yml -f docker-compose.splunk.yml ps
```

## 4) Verify logs arrive in Splunk

Run in Splunk Search:

```spl
index=main sourcetype="lets-go:container"
| stats count by host source sourcetype
```

Optional service filter:

```spl
index=main sourcetype="lets-go:container" (source="lets-go-backend" OR source="lets-go-frontend")
| sort - _time
```

## Stop

```powershell
docker compose -f docker-compose.yml -f docker-compose.splunk.yml down
```

## Notes

- The Splunk Docker logging driver sends logs only. Metrics/traces are separate and should use OpenTelemetry Collector.
- If you see TLS/certificate errors, set `SPLUNK_INSECURE_SKIP_VERIFY=true` temporarily and switch back to `false` once certificates are correct.

# Service Template (CI + Helm + Monitoring + Logging)

This template bootstraps a new backend service with:

- Reusable GitHub CI workflow usage
- Helm chart for Kubernetes deployment
- Monitoring defaults for Prometheus/Grafana
- Logging scrape configuration for Loki/Promtail

## Files

- `.github/workflows/reusable-service-ci.yml`
  Reusable CI workflow called by service-specific workflows.
- `templates/service-template/.github/workflows/service-ci.yml`
  Example service workflow using placeholders.
- `templates/service-template/chart/`
  Helm chart with deployment, service, ingress, and optional ServiceMonitor.
- `templates/service-template/monitoring/prometheus-rules.yaml`
  Example alert rules.
- `templates/service-template/logging/promtail-scrape-config.yaml`
  Example log collection config.

## How To Use

1. Copy `templates/service-template` into your new service folder, for example `services/payments`.
2. Replace all `__SERVICE_NAME__` placeholders with your service name.
3. Update `values.yaml` image repository, ports, ingress host, and resources.
4. Add or adjust service tests (`npm test`) and build scripts.
5. Add the service-specific workflow into `.github/workflows/` using the provided example.
6. If using kube-prometheus-stack, set `serviceMonitor.enabled=true` in chart values.

## Interview Talking Points

- We introduced a repeatable service template to reduce copy-paste YAML.
- CI standards are centralized with `workflow_call` in `reusable-service-ci.yml`.
- Runtime standards are encoded in Helm: probes, resources, structured logging, and metrics endpoints.
- Monitoring and logging become default-on capabilities for every new service.

# Splunk + AWS Hosting Complete Guide (Interview Ready)

This guide is designed for two goals:
- Build and operate observability for this project on AWS using Splunk.
- Prepare interview-ready explanations with practical architecture and trade-offs.

---

## 1. What Splunk Solves For This Project

Your project includes frontend, backend, and infrastructure components. Splunk helps you:
- Centralize logs from app containers and AWS services.
- Detect production issues early (5xx spikes, auth failures, latency growth).
- Correlate incidents across application, infrastructure, and deployments.
- Build dashboards and alerts for SRE/DevOps operations.
- Support audit/compliance with searchable retained events.

---

## 2. AWS Target Architecture (Recommended)

Use this reference architecture in interviews and implementation:

1. Runtime:
- Option A: Amazon ECS Fargate (simple operations, no cluster management)
- Option B: Amazon EKS (Kubernetes-native, higher control)

2. Ingestion path:
- App/container logs -> OpenTelemetry Collector or Fluent Bit -> Splunk HEC
- AWS service logs (CloudWatch, ALB, VPC Flow, CloudTrail) -> Splunk via Data Manager/add-ons or forwarders

3. Splunk platform choices:
- Splunk Cloud (recommended for production speed)
- Self-managed Splunk Enterprise on EC2 (more control, more ops overhead)

4. Security envelope:
- Private subnets for workloads
- NAT Gateway or private egress strategy for outbound HEC traffic
- TLS everywhere
- Secrets in AWS Secrets Manager/SSM Parameter Store

5. Core AWS integrations to enable:
- CloudWatch logs/metrics
- CloudTrail
- ALB/NLB access logs
- WAF logs (if using AWS WAF)
- ECR image scan events

---

## 3. Splunk Data Types You Should Collect

1. Logs:
- Backend API logs
- Frontend runtime/API error logs
- Reverse proxy/ingress logs
- Container runtime logs

2. Metrics:
- CPU, memory, request rate, error rate, latency (RED method)
- Pod/task restart count
- DB and queue metrics if present

3. Traces (strongly recommended):
- API request traces with span errors and latency
- Trace-to-log correlation using request ID/trace ID

4. Security events:
- Auth failures
- IAM/CloudTrail anomalies
- WAF blocked requests

---

## 4. Environment Strategy (Interview Signal)

Use environment separation:
- dev
- staging
- prod

In Splunk, isolate data with index strategy like:
- idx_website_dev
- idx_website_staging
- idx_website_prod

Tag all events with metadata fields:
- env
- service
- version
- region
- cluster

Why this matters in interviews:
- Better blast radius control
- Cleaner RBAC and retention policies
- Faster troubleshooting by scope

---

## 5. Deployment Models on AWS

### Model A: ECS Fargate + Splunk (Most practical for many teams)

1. Build images and push to ECR.
2. Run backend/frontend as ECS services.
3. Configure logs:
- Option 1: awsfirelens (Fluent Bit) to Splunk HEC
- Option 2: CloudWatch -> Splunk ingestion
4. Add OTel SDK in backend for traces/metrics.
5. Route telemetry through OTel Collector sidecar or central collector.

Pros:
- Lower operational complexity.
- Quick path to production.

Cons:
- Less Kubernetes flexibility.

### Model B: EKS + Splunk (Best for K8s-centric orgs)

1. Deploy Splunk OTel Collector as daemonset/agent.
2. Send container logs, kube events, node metrics.
3. Instrument backend with OTel exporter.
4. Configure Splunk dashboards and SLO alerts.

Pros:
- Deep Kubernetes observability.
- Strong extensibility.

Cons:
- Higher operational overhead.

---

## 6. HEC and Logging Design

Use HEC endpoint securely:
- HEC URL over TLS only
- Token stored in Secrets Manager (never in image)
- Token rotation policy

Best practices:
1. Sourcetype conventions:
- website:backend
- website:frontend
- website:infra

2. Source conventions:
- ecs/service-name or k8s/pod-name

3. Field extraction:
- status_code
- route
- latency_ms
- user_id (if allowed by policy)
- request_id
- trace_id

4. PII controls:
- Redact secrets/tokens/passwords at source or collector
- Never index sensitive payload fields unnecessarily

---

## 7. Security and Compliance Controls

1. Access:
- SSO (SAML/OIDC)
- Role-based access by team and environment

2. Transport security:
- TLS 1.2+
- Certificate validation (avoid insecure skip verify in prod)

3. Secrets:
- AWS Secrets Manager + IAM task roles
- Regular token rotation

4. Data governance:
- Retention by data criticality
- Archive cold data to cheaper storage tier when applicable

5. Auditability:
- Log administrative actions in Splunk
- Monitor token usage anomalies

---

## 8. Cost Optimization Plan

Splunk cost is usually ingestion + retention + compute.

Control costs with:
1. Log sampling for noisy info-level logs.
2. Filter/drop low-value logs at collector.
3. Keep structured logs concise.
4. Short retention for verbose debug indexes.
5. Use summary indexing for long-term trends.
6. Track ingest volume per service and enforce budgets.

Interview line:
"I treat observability as a product with SLO and budget guardrails, not unlimited log dumping."

---

## 9. Reliability Patterns

1. Buffering/retry in collector for transient network issues.
2. Backpressure controls to prevent app slowdown.
3. Multi-AZ workload deployment on AWS.
4. Health checks for telemetry pipeline itself.
5. Alert on "no data" conditions (silent failures).

---

## 10. Dashboard Blueprint For This Project

### A) Operations Health Dashboard
Panels:
- Request volume per service
- Error count per service
- Container restart trend
- Last event seen by service

### B) Error Investigation Dashboard
Panels:
- Top exceptions/errors
- 5xx by endpoint
- Recent failed requests with request_id
- Correlated logs by trace_id

### C) Release Regression Dashboard
Panels:
- Error rate pre/post deployment
- p95 latency trend
- New error signatures after release
- Version-wise failure distribution

---

## 11. Alerting Blueprint

1. Critical:
- Backend 5xx rate > threshold for 5 min
- No logs from backend for 10 min
- Authentication failure burst

2. High:
- p95 latency breach
- Container restart spike

3. Medium:
- Ingestion lag increased
- Sudden cardinality explosion (new noisy fields)

Alert message should include:
- service
- env
- region
- runbook link
- top 5 recent errors

---

## 12. Interview Questions and Strong Answers

### Q1: Why Splunk over basic CloudWatch-only?
Answer:
CloudWatch is great as an AWS-native source, but Splunk provides stronger cross-source correlation, richer search, and mature operational workflows for multi-system incident response.

### Q2: How do you prevent observability costs from exploding?
Answer:
Use ingestion governance: filter noisy logs, enforce structured logging contracts, apply retention tiers, and monitor ingest-per-service with budget alerts.

### Q3: How do you secure HEC tokens in AWS?
Answer:
Store in Secrets Manager, inject via task role or pod identity, rotate periodically, restrict token scope/index, and monitor token usage.

### Q4: How would you debug intermittent API failures?
Answer:
Correlate by request_id/trace_id across frontend, backend, and load balancer logs, then inspect latency/error bursts around deployment or dependency saturation windows.

### Q5: What are key SLO signals for this app?
Answer:
Availability, error rate, request latency (p95/p99), and freshness of telemetry pipeline (no-data detection).

---

## 13. 30-60-90 Day Rollout Plan (Interview Friendly)

30 days:
- Centralize logs for all services
- Baseline dashboards
- Basic critical alerts

60 days:
- Add traces and RED metrics
- Add deployment correlation fields (version, commit SHA)
- Run incident drills

90 days:
- SLO-based alert tuning
- Cost governance automation
- Compliance and retention refinement

---

## 14. Production Readiness Checklist

- [ ] All services emit structured JSON logs
- [ ] request_id and trace_id present end-to-end
- [ ] HEC TLS and token rotation enabled
- [ ] Env-specific indexes and RBAC configured
- [ ] Dashboards and alerts validated in staging
- [ ] No-data alert for telemetry pipeline
- [ ] Runbooks linked from alerts
- [ ] Ingestion budget and retention policy documented

---

## 15. Practical AWS Recommendation For Your Project

If your primary goal is speed + reliability for interview and real deployment:
1. Start with ECS Fargate.
2. Use FireLens/OTel Collector for Splunk ingestion.
3. Keep Splunk Cloud as observability backend.
4. Add EKS only if you need Kubernetes-native controls.

This gives a strong "practical DevOps" narrative: fast to production, secure telemetry, cost-aware operations, and clear incident response maturity.

---

## 16. One-Minute Interview Pitch

"I would host the application on AWS using ECS Fargate (or EKS if Kubernetes control is required), stream structured logs and OTel telemetry to Splunk via HEC, and build service-level dashboards for RED metrics. I would secure tokens in Secrets Manager, enforce index and retention governance, and implement SLO-based alerts with runbooks. This provides fast incident detection, reliable root-cause analysis, and controlled observability cost at scale."
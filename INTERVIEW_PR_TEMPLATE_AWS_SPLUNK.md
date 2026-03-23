# PR Template: AWS Cost-Optimized Hosting + Splunk Observability

## Title
feat(aws): cost-optimized hosting with Splunk-ready observability

## 1. Problem Statement
This PR introduces an AWS deployment path optimized for cost while preserving production-grade observability and incident response.

## 2. Scope
Included:
- Frontend deployment model on S3 + CloudFront
- Backend runtime on ECS Fargate with Spot strategy
- Logging and telemetry routing strategy for Splunk
- Baseline dashboard and alert query definitions

Not included:
- Full migration to EKS
- Enterprise SSO integration for Splunk
- Long-term data warehouse analytics

## 3. Architecture Decision
Chosen option:
- Frontend: S3 + CloudFront
- Backend: ECS Fargate + Fargate Spot
- Logs: CloudWatch as source + selective Splunk ingestion

Why this option:
- Lower fixed monthly cost than always-on multi-container frontend/backend runtime
- Fast deployment with managed AWS services
- Strong interview narrative: balance of reliability, observability, and spend

## 4. Cost Optimization Decisions
- Frontend removed from always-on compute
- Backend right-sized at low baseline CPU/memory
- Spot capacity weighted for burst scaling
- CloudWatch retention bounded (7-14 days)
- Splunk receives high-value logs only (warn/error/security)

Expected impact:
- Reduced compute and observability spend compared to full-log, always-on container approach

## 5. Security Controls
- Splunk HEC token stored in Secrets Manager
- TLS-only endpoints
- Least-privilege IAM roles for ECS tasks
- No secrets committed to repo

## 6. Observability Plan
Metrics:
- Request rate, error rate, latency, restarts

Logs:
- Structured JSON fields: env, service, version, request_id, trace_id

Alerts:
- 5xx spike
- No-data from backend service
- Restart spike

## 7. Reliability and Rollback
- ECS task definition revision rollback strategy
- CloudFront invalidation rollback for frontend artifacts
- Deployment health checks before traffic shift

## 8. Testing Evidence
Local validation:
- Docker Desktop app functionality validated
- Splunk local HEC integration validated

AWS validation (to capture in PR before merge):
- ECS service healthy
- CloudWatch logs present
- Splunk queries returning expected fields/events

## 9. Risks and Mitigations
Risk: Spot interruptions
Mitigation: Keep baseline on-demand capacity (`base=1`) and use Spot for scale-out only.

Risk: Splunk ingest cost drift
Mitigation: Filter noisy logs, track ingest-per-service, budget alerts.

Risk: Missing trace/log correlation
Mitigation: enforce request_id/trace_id in logging contract.

## 10. Runbook References
- Use [AWS_CLI_COST_OPTIMIZED_RUNBOOK.md](AWS_CLI_COST_OPTIMIZED_RUNBOOK.md) for deployment commands.
- Use [SPLUNK_AWS_INTERVIEW_GUIDE.md](SPLUNK_AWS_INTERVIEW_GUIDE.md) for architecture and interview framing.

## 11. Interview Talking Points (Quick)
- Why ECS over EKS initially: lower operational overhead and faster time-to-value.
- Why selective Splunk ingestion: primary lever for observability cost control.
- Why S3+CloudFront for frontend: serverless static hosting is cheapest at this scale.
- How reliability is preserved: base on-demand + Spot weighting + rollback revisions.

## 12. Reviewer Checklist
- [ ] No secrets in git history
- [ ] Cost assumptions are realistic and documented
- [ ] IAM permissions follow least privilege
- [ ] Alerts and dashboards are actionable
- [ ] Rollback steps are tested

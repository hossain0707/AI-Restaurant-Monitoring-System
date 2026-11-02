# Product Roadmap — TableSight

This is a roadmap, not a claim of completed production readiness.

| Phase | Deliverables | Exit / acceptance criteria |
|--|--|--|
| 0 — Interactive preview | Responsive 3D floor, demo simulation, operator controls, on-device webcam detection, IP bridge | Static preview works; browser permission flows tested; no default video storage |
| 1 — Scientific validation | Labeled consenting dataset, ROI editor improvements, tracked object/pose comparator, per-table metrics | Precision/recall and false transition rate reported by camera and seating geometry; predefined evaluation protocol |
| 2 — Backend persistence | FastAPI API, Postgres event store, observability, role-based permissions, camera registry | Contract/API tests pass; events durable; replayable audit |
| 3 — Edge deployment | RTSP/NVR adapters, bounded frame queues, WebRTC or secure HLS, supervised workers, automated recovery | Documented reconnect tests, secure HTTPS streaming, configurable frame rate |
| 4 — Operational pilot | Staff workflows, alert routing, housekeeping confirmations, integrations, privacy signage | Written venue approval, human review, measurable time-to-clean gains |
| 5 — Commercial readiness | SSO/RBAC, multitenancy, billing/tenant isolation, remote administration, security audit | Independent security review and documented load, recovery, privacy and accuracy SLOs |

## Suggested validation metrics

- Table occupancy precision/recall and F1, stratified by table and crowd density.
- False occupancy events per table-hour and missed departures per 100 visits.
- Median / P95 state-transition latency versus human-labeled ground truth.
- Performance at 2, 5, 10 and 20 FPS across CPU/mobile/edge hardware.
- Camera outages, dropped-frame recovery, zone calibration robustness, lighting shift.
- Usability: time to correct a mistake, cleaning task completion delay.

## Principles

No fabricated benchmark results. No real customer identity tracking. No unattended deployment of the unauthenticated bridge. Privacy review and owner permissions before external pilots.

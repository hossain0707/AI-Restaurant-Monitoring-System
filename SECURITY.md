# Security & Privacy

**Owner:** Md Najmul Hossain  
**Status:** Prototype security baseline; not a production-security certification.

## What this version actually does

- Browser camera uses `getUserMedia` only after explicit consent.
- Client-side COCO-SSD inference processes images within the user's browser. It does not submit frames to a hosted AI API.
- The IP/RTSP bridge reads frames into RAM and streams reduced-resolution MJPEG to the same local origin; it does not record videos.
- The website contains no authentication and no external database. Its demo and table states are session-memory only.
- The optional detection model/scripts may download from public CDN endpoints when the user enables AI. For fully offline/private environments, host verified copies of those scripts and model weights.

## Not safe without additional engineering

The bridge has **no user authentication** and should only be used on the local host behind a trusted environment. Never bind it to `0.0.0.0` unless an authenticated TLS reverse proxy and network access policy have been implemented. Do not publish camera network addresses, passwords, or access keys in the repository. Avoid camera passwords in shell history where possible; use a protected environment configuration or secret manager. Never store video or customer-identifying metadata without explicit authorization and legal basis.

For commercial deployment, implement user sign-in, RBAC, audit logs, rate limiting, isolated camera access, secrets storage, TLS, CSP, dependency pinning, network restrictions, retention/deletion policies, operator sign-off, automated tests, and penetration testing.

## Camera signage and consent

Restaurant surveillance requirements depend on jurisdiction. Obtain legal review for CCTV notices, lawful monitoring purpose, area restrictions, employee/customer notice, and any data-processing agreement. No face identification or demographic classification should be added.

## Scope limitations

Person-in-region inference is **not** an objective guarantee of seat occupancy or customer wait time. Current prototype provides no predictive ML model, no production-grade anomaly detector, no live booking integrations, and no validated SLA. Test all claims before commercial use.

## Reporting security issues

Contact the repository owner privately with a minimal reproduction; do not disclose customer recordings or credentials in public issues.

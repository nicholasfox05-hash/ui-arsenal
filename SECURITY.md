# Security

This is a localhost development application, not a hardened multi-user hosted service.
It binds to IPv4 loopback, validates Host and Origin, rejects cross-site API reads,
has no mutating HTTP endpoints and does not execute imported packages.

Do not expose it through a tunnel or bind it to a public interface. Local users and
programs can still access localhost. Browser-origin checks are not authentication.

Private metadata is read from an explicitly configured directory. Only a small
allowlist is exported; source bodies, media and filesystem paths remain private.
Intake access failure is visible and never silently substituted with sample data.

Do not place credentials in catalog records. Do not include secrets in public bug
reports. Report suspected vulnerabilities through GitHub private vulnerability
reporting if available, or contact the repository owner without publishing secrets.

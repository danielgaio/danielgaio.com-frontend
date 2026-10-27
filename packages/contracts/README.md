# Shared API contracts

This directory defines the home for TypeScript contracts consumed by both applications when real API features are implemented. Add a workspace package when there is a concrete shared contract and consumer.

Keep public request/response schemas and appropriate validation here. Backend persistence models, credentials and server-only dependencies belong in the API. Do not couple the frontend to database internals or create unused sample contracts just to populate the workspace.

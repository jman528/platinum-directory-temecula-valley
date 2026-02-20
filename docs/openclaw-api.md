# OpenClaw Context API

Read-only API endpoint for OpenClaw and external AI agents to query real-time Platinum Directory data.

## Endpoint

```
GET /api/openclaw/context
```

All other HTTP methods return `405 Method Not Allowed`.

## Authentication

Every request must include the header:

```
X-OpenClaw-Key: <your-api-key>
```

The key must match the `OPENCLAW_API_KEY` environment variable on the server. Returns `401` if missing or wrong.

## Query Parameters

| Param      | Required | Description                                         |
|------------|----------|-----------------------------------------------------|
| `type`     | Yes      | One of: `stats`, `businesses`, `offers`, `search`   |
| `q`        | For search | Search query (matches name, description)           |
| `city`     | No       | Filter by city name (case-insensitive)              |
| `category` | No       | Filter by category name (partial match)             |
| `limit`    | No       | Max results, default 20, max 100                    |

## Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "type": "stats",
    "count": 1,
    "query_time_ms": 45
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Description of the problem"
}
```

## Query Types

### `type=stats`

Platform-wide statistics.

```bash
curl -H "X-OpenClaw-Key: YOUR_KEY" \
  "https://yoursite.com/api/openclaw/context?type=stats"
```

Response data:

```json
{
  "total_businesses": 2500,
  "claimed": 120,
  "unclaimed": 2380,
  "active_offers": 15,
  "cities_covered": 11,
  "cities": ["Temecula", "Murrieta", "Hemet", ...],
  "recent_signups_30d": 42
}
```

### `type=businesses`

List active businesses with optional city/category filters.

```bash
curl -H "X-OpenClaw-Key: YOUR_KEY" \
  "https://yoursite.com/api/openclaw/context?type=businesses&city=Temecula&limit=10"
```

Response data (array):

```json
[
  {
    "id": "uuid",
    "name": "Ponte Winery",
    "city": "Temecula",
    "state": "CA",
    "category": "Wineries & Vineyards",
    "tier": "verified_platinum",
    "claimed": true,
    "slug": "ponte-winery",
    "phone": "(951) 694-8855",
    "website": "https://pontewinery.com",
    "is_active": true
  }
]
```

### `type=offers`

Active Smart Offers, optionally filtered by city.

```bash
curl -H "X-OpenClaw-Key: YOUR_KEY" \
  "https://yoursite.com/api/openclaw/context?type=offers&city=Temecula"
```

Response data (array):

```json
[
  {
    "id": "uuid",
    "business_name": "Ponte Winery",
    "title": "50% Off Wine Tasting",
    "original_price": 40,
    "sale_price": 20,
    "city": "Temecula",
    "slug": "50-off-wine-tasting"
  }
]
```

### `type=search`

Full-text search across business name and description.

```bash
curl -H "X-OpenClaw-Key: YOUR_KEY" \
  "https://yoursite.com/api/openclaw/context?type=search&q=pizza&city=Temecula"
```

Response data (array):

```json
[
  {
    "id": "uuid",
    "name": "Pizza Factory",
    "description": "Family pizza restaurant...",
    "city": "Temecula",
    "state": "CA",
    "category": "Restaurants & Dining",
    "tier": "free",
    "claimed": false,
    "slug": "pizza-factory",
    "phone": "(951) 555-0000",
    "website": null
  }
]
```

## Setup

1. Generate a secure API key: `openssl rand -hex 32`
2. Add to `.env.local`: `OPENCLAW_API_KEY=<generated-key>`
3. Share the key with the AI agent / OpenClaw configuration
4. The endpoint is live at `/api/openclaw/context`

## Notes

- This endpoint is **read-only** — no data is ever written.
- Uses the Supabase service role key for reads (bypasses RLS for read access only).
- Rate limiting should be handled at the infrastructure level (Vercel, Cloudflare, etc.).

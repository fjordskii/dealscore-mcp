# DealScore MCP

**A used-car price check for AI agents.** DealScore is a hosted remote [Model Context Protocol](https://modelcontextprotocol.io) server. Your agent sends a vehicle (VIN, or year + make + model), an asking price, and the mileage. DealScore grades that price against live US dealer comps and returns a grade, a 0 to 100 score, the expected price band, and a plain-text brief with risks that the agent can quote.

This repository is a **listing and documentation repo only**. It has no server source code and nothing to install or run. The server is hosted at the endpoint below.

| | |
|---|---|
| **MCP endpoint** | `https://cardealscore.com/api/mcp` |
| **Transport** | Streamable HTTP |
| **Auth** | OAuth 2.1 with PKCE, signing in through the browser (default). API key as a fallback. |
| **Official MCP Registry** | [`com.cardealscore/dealscore`](https://registry.modelcontextprotocol.io/v0/servers?search=com.cardealscore/dealscore) |
| **Server card** | [`/.well-known/mcp/server-card.json`](https://cardealscore.com/.well-known/mcp/server-card.json) |
| **Docs** | [cardealscore.com/docs/api](https://cardealscore.com/docs/api?ref=github&utm_source=github&utm_medium=mcp_directory) |
| **Connect guide** | [cardealscore.com/agents](https://cardealscore.com/agents?ref=github&utm_source=github&utm_medium=mcp_directory) |

**Pricing:** Free: 5 scored deals/month. Builder: $19/mo (founding price) for 1,000 scored calls/month. Only scored results count; `explain_grade` and `health` are free. See [pricing](https://cardealscore.com/pricing?ref=github&utm_source=github&utm_medium=mcp_directory).

## Tools

| Tool | What it does |
|---|---|
| `score_deal` | Grades a used car's asking price against expected market value from live US dealer comps. Returns the grade (Great / Good / Fair / High / Overpriced), the score, the expected price band, the brief, and the risks. |
| `explain_grade` | Explains the `score_v2` rubric grade for a given `delta_pct`. This tool is read-only. It doesn't make a comps call. |
| `health` | Reports service health, coverage, cache policy, and limitations. This tool is read-only. |

`score_deal` inputs: `asking_price` and `mileage` are required. You also need either a `vin` or `year` + `make` + `model`. `trim` and a 5-digit `zip` are optional. If you leave out `zip`, DealScore uses US national comps.

## Authentication

1. **OAuth 2.1 (default).** Add the URL with no headers. Your MCP client discovers OAuth by itself and opens a browser to sign you in with an email link.
   - Protected resource metadata: `https://cardealscore.com/.well-known/oauth-protected-resource`
   - Authorization server metadata: `https://cardealscore.com/.well-known/oauth-authorization-server`
   - The server supports PKCE (S256), dynamic client registration, and Client ID Metadata Documents. The scope is `mcp`.
2. **API key (fallback).** Use this for clients that can't do OAuth, or for scripts. Sign in at [cardealscore.com](https://cardealscore.com/agents?ref=github&utm_source=github&utm_medium=mcp_directory) to create a key. Send it as `x-api-key: <key>` or `Authorization: Bearer <key>`.

## Install

### Cursor

Add this to `~/.cursor/mcp.json` to use it in every project, or to `.cursor/mcp.json` to use it in one project:

```json
{
  "mcpServers": {
    "dealscore": {
      "url": "https://cardealscore.com/api/mcp"
    }
  }
}
```

Cursor discovers OAuth and opens a browser so you can sign in.

**API key fallback:**

```json
{
  "mcpServers": {
    "dealscore": {
      "url": "https://cardealscore.com/api/mcp",
      "headers": {
        "x-api-key": "${env:DEALSCORE_API_KEY}"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http dealscore https://cardealscore.com/api/mcp
claude mcp login dealscore
```

You can also run `/mcp` inside Claude Code, pick `dealscore`, and choose **Authenticate**.

**API key fallback:**

```bash
claude mcp add --transport http dealscore https://cardealscore.com/api/mcp \
  --header "x-api-key: YOUR_DEALSCORE_API_KEY"
```

### Claude Desktop and claude.ai

Claude Desktop and claude.ai add remote servers as **custom connectors**. You don't edit `claude_desktop_config.json` for this.

1. Open **Customize → Connectors**.
2. Choose **Add custom connector**. In some versions this is **Add → Custom → Web**.
3. Enter the name `DealScore` and the URL `https://cardealscore.com/api/mcp`.
4. Leave authentication on OAuth. Then click **Add** and **Connect**, and sign in in the browser.

On Team and Enterprise plans, an Owner adds the connector under **Organization settings → Connectors**. Members then connect it themselves. Claude connects from Anthropic's cloud, so the endpoint has to be public, and it is.

### VS Code (GitHub Copilot agent mode)

Add this to `.vscode/mcp.json` in the workspace, or open your user configuration with **MCP: Open User Configuration**:

```json
{
  "servers": {
    "dealscore": {
      "type": "http",
      "url": "https://cardealscore.com/api/mcp"
    }
  }
}
```

You can also add it from the command line:

```bash
code --add-mcp "{\"name\":\"dealscore\",\"type\":\"http\",\"url\":\"https://cardealscore.com/api/mcp\"}"
```

**API key fallback.** VS Code prompts for the key once and stores it:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "dealscore-api-key",
      "description": "DealScore API key",
      "password": true
    }
  ],
  "servers": {
    "dealscore": {
      "type": "http",
      "url": "https://cardealscore.com/api/mcp",
      "headers": {
        "x-api-key": "${input:dealscore-api-key}"
      }
    }
  }
}
```

### Portable `.mcp.json` (Claude Code project scope, VS Code portable format)

This repo includes a [`.mcp.json`](.mcp.json) with the same entry:

```json
{
  "mcpServers": {
    "dealscore": {
      "type": "http",
      "url": "https://cardealscore.com/api/mcp"
    }
  }
}
```

### Any Streamable HTTP MCP client

- URL: `https://cardealscore.com/api/mcp`
- Transport: Streamable HTTP. Send JSON-RPC with `POST`, using `Content-Type: application/json` and `Accept: application/json, text/event-stream`.
- Auth: follow the `WWW-Authenticate` / `resource_metadata` challenge to run OAuth 2.1, or send `x-api-key`.

`initialize` and `tools/list` are public, so you can inspect the server before you sign in:

```bash
curl -s -X POST https://cardealscore.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

`tools/call` needs credentials. Without them it returns `401` with a `WWW-Authenticate: Bearer … resource_metadata=…` header:

```bash
curl -s -X POST https://cardealscore.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-api-key: YOUR_DEALSCORE_API_KEY" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"score_deal","arguments":{"year":2020,"make":"Toyota","model":"Camry","asking_price":18500,"mileage":62000}}}'
```

## Limitations

- Comps are US dealer listings, so a private-party asking price may grade lower.
- DealScore doesn't fetch Facebook Marketplace or Craigslist URLs. Send the vehicle fields instead.
- When the data is too thin to grade, the response has `coverage: cannot_score` and a reason. DealScore never falls back to a guessed grade.

## Files in this repo

- `README.md`: this page.
- `server.json`: a mirror of the Official MCP Registry entry `com.cardealscore/dealscore`. The registry is the source of truth.
- `.mcp.json`: a portable client config.
- `LICENSE`: MIT. It covers the documentation and config snippets in this repository only.
- `scripts/check-readme.mjs`: checks that this README names the live rubric version and stays free of stale hosts. Run `node scripts/check-readme.mjs`.

## Contact

Questions, issues, or partnership requests: **ford@fordheacock.com**

Privacy: [cardealscore.com/privacy](https://cardealscore.com/privacy) · Terms: [cardealscore.com/terms](https://cardealscore.com/terms)

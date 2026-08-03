# Web Research

Use the Firecrawl MCP server (`firecrawl-mcp`) for web tasks by default.

## Tools

- **`firecrawl_search`**: Search the web. You can also request page content. Use this tool when you do not know which site has the answer. After you use the results, always call `firecrawl_search_feedback` with the returned `id`.
- **`firecrawl_scrape`**: Get clean Markdown, HTML, or JSON from one known URL. Use JSON with a schema for specific data. Use Markdown for a complete page. Add `waitFor` for a single-page application that renders with JavaScript.
- **`firecrawl_map`**: List the URLs on a site. Use this tool before `firecrawl_scrape` when you do not know the exact page URL.
- **`firecrawl_crawl`**: Get content from many pages on one site. Limit the crawl depth and page count to control token use.
- **`firecrawl_extract`**: Extract structured data from one or more URLs. Use a JSON schema for the output.
- **`firecrawl_interact`**: Use a live browser to click controls, fill forms, log in, move through pages, or use JavaScript-heavy sites. Call `firecrawl_interact_stop` when you finish.
- **`firecrawl_parse`**: Convert a local PDF, DOCX, XLSX, or HTML file to Markdown or JSON.
- **`firecrawl_monitor_*`**: Create monitors for web pages or search queries. Monitors report changes. Prefer a monitor when you need repeated checks.
- **`firecrawl_research_*`**: Search papers, follow citation links, and verify information in papers.

## Rules

- Prefer the native `webfetch` tool to fetch web pages. Use Firecrawl only when `webfetch` is not available or does not return useful content.
- If a scrape returns no useful content, try these steps in order: add `waitFor`; try another URL or URL hash; use `firecrawl_map` to find the correct URL; use `firecrawl_interact` as the last option.
- For specific data, such as prices, fields, or specifications, use JSON with a schema. Do not use Markdown for this data.
- Use Exa (`exa_web_search_exa` or `exa_web_fetch_exa`) only when Firecrawl is not available or does not return useful content.

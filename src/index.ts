const ALLOWED_HOSTS = new Set([
  "github.com",
  "raw.githubusercontent.com",
  "gist.githubusercontent.com",
  "objects.githubusercontent.com",
  "github-releases.githubusercontent.com",
]);

const CACHEABLE_STATUS = new Set([200, 206, 301, 302, 307, 308]);

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return withCors(new Response("Method Not Allowed", { status: 405 }));
    }

    const url = new URL(request.url);
    const target = resolveTarget(url);
    if (!target) {
      return withCors(renderHome());
    }

    if (!ALLOWED_HOSTS.has(target.hostname)) {
      return withCors(new Response("Forbidden host", { status: 403 }));
    }

    const cache = (globalThis as unknown as { caches: CacheStorage & { default: Cache } }).caches.default;
    const cacheKey = new Request(target.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return withCors(cached);
    }

    const upstreamHeaders = new Headers(request.headers);
    upstreamHeaders.set("host", target.hostname);
    upstreamHeaders.delete("cookie");
    upstreamHeaders.delete("authorization");
    upstreamHeaders.delete("cf-connecting-ip");
    upstreamHeaders.delete("cf-ipcountry");
    upstreamHeaders.delete("cf-ray");
    upstreamHeaders.delete("x-forwarded-for");
    upstreamHeaders.delete("x-real-ip");

    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      redirect: "follow",
    });

    const response = normalizeResponse(upstream);
    if (CACHEABLE_STATUS.has(response.status) && request.method === "GET") {
      const cacheControl = response.headers.get("cache-control");
      if (!cacheControl || !cacheControl.includes("no-store")) {
        const copy = response.clone();
        copy.headers.set("cache-control", cacheControl ?? "public, max-age=3600");
        copy.headers.set("x-github-proxy-cache", "HIT-ELIGIBLE");
        await cache.put(cacheKey, copy);
      }
    }

    return withCors(response);
  },
};

function resolveTarget(url: URL): URL | null {
  const rawPath = url.pathname.replace(/^\/+/, "");
  if (!rawPath || rawPath === "favicon.ico") {
    return null;
  }

  const candidate = rawPath.startsWith("http://") || rawPath.startsWith("https://")
    ? rawPath
    : `https://github.com/${rawPath}`;

  try {
    const target = new URL(candidate);
    if (!ALLOWED_HOSTS.has(target.hostname)) {
      return null;
    }
    return target;
  } catch {
    return null;
  }
}

function normalizeResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.delete("content-security-policy");
  headers.delete("content-security-policy-report-only");
  headers.set("x-github-proxy", "cloudflare-worker");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,HEAD,OPTIONS");
  headers.set("access-control-allow-headers", "*");
  headers.set("access-control-expose-headers", "Content-Length,Content-Range,Location,ETag,Cache-Control");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function renderHome(): Response {
  return new Response(
    `GitHub Proxy\n\nUse:\n/https://github.com/user/repo/releases/download/v1.0/app.zip\n/user/repo/releases/download/v1.0/app.zip\n`,
    {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    },
  );
}

import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.all("{*path}", async (req, res) => {
  const aiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const aiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const proxySecret = process.env.AI_PROXY_SECRET;

  if (!aiBaseUrl) {
    return res.status(503).json({ error: "AI proxy not available on this host" });
  }

  if (proxySecret) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${proxySecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const path = req.path === "/" ? "" : req.path;
  const targetUrl = `${aiBaseUrl}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (aiApiKey) {
    headers["Authorization"] = `Bearer ${aiApiKey}`;
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const upstream = await fetch(targetUrl, fetchOptions);

  const contentType = upstream.headers.get("content-type") || "application/json";
  res.status(upstream.status).setHeader("Content-Type", contentType);

  if (contentType.includes("text/event-stream")) {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const reader = upstream.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
    }
    res.end();
  } else {
    const data = await upstream.json();
    res.json(data);
  }
});

export default router;

/** Serve the original MP4 with byte ranges for native seeking, including Safari. */
export async function serveVideo(request: Request, assets: { fetch(request: Request): Promise<Response> }, knownSize: number): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const assetRequest = new Request(request);
  for (const name of ["Range", "If-Range", "If-None-Match", "If-Modified-Since"]) assetRequest.headers.delete(name);
  const response = await assets.fetch(assetRequest);
  if (response.status !== 200) return response;
  const size = Number(response.headers.get("Content-Length") ?? knownSize);
  if (!Number.isSafeInteger(size) || size <= 0) return response;
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(size));
  const full = () => new Response(response.body, { status: 200, headers });
  if (request.method === "HEAD") return full();
  const ifRange = request.headers.get("If-Range");
  if (ifRange && (ifRange.startsWith('W/') || (ifRange !== headers.get("ETag") && ifRange !== headers.get("Last-Modified")))) return full();
  const range = request.headers.get("Range");
  const match = range?.match(/^bytes=(\d*)-(\d*)$/);
  // Malformed or multiple ranges may be ignored; a valid unsatisfied range is 416.
  if (!match || (!match[1] && !match[2])) return full();
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] ? (match[2] ? Math.min(Number(match[2]), size - 1) : size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start || (!match[1] && Number(match[2]) === 0)) {
    await response.body?.cancel();
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, { status: 416, headers });
  }
  if (!response.body) return full();
  const reader = response.body.getReader();
  let offset = 0;
  // Slice as a stream, rather than buffering the entire video for every viewer.
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { controller.close(); return; }
          const from = Math.max(0, start - offset);
          const to = Math.min(value.length, end + 1 - offset);
          offset += value.length;
          if (to > from) controller.enqueue(value.subarray(from, to));
          if (offset > end) { controller.close(); await reader.cancel(); return; }
          if (to > from) return;
        }
      } catch (error) { controller.error(error); }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(body, { status: 206, headers });
}

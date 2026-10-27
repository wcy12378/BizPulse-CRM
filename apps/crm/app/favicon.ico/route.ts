// Browsers can request this legacy URL while streamed metadata is in flight.
// Resolve the current installation brand through the existing runtime icon.
export function GET() {
  return new Response(null, {
    status: 307,
    headers: { Location: "/icon", "Cache-Control": "no-store" },
  });
}

import { POST as exportToN8n } from "../export/n8n/route";

/** Legacy alias — prefer POST /api/export/n8n */
export const POST = exportToN8n;
export const runtime = "nodejs";

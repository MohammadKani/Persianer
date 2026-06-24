// CDP helper: capture a screenshot of the options page and save it as a PNG.
const fs = require("fs");
const targetWs = "ws://127.0.0.1:9222/devtools/page/AE9F5A01E45F896A7E512178785A4019";

const ws = new WebSocket(targetWs);
let id = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

ws.addEventListener("open", async () => {
  try {
    await send("Page.enable");
    const result = await send("Page.captureScreenshot", { format: "png" });
    const data = Buffer.from(result.data, "base64");
    const outPath = "Z:\\Dev\\Persianer\\.test-cdp\\options-screenshot.png";
    fs.writeFileSync(outPath, data);
    console.log("Screenshot saved to:", outPath);
    ws.close();
  } catch (e) {
    console.error("ERROR:", e.message);
    ws.close();
  }
});

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  }
});

ws.addEventListener("error", (e) => { console.error("WS ERROR:", e.message || e); process.exit(1); });
ws.addEventListener("close", () => { process.exit(0); });
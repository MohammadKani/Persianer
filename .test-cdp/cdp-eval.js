// CDP helper: evaluate a JS expression on the options page and print the result.
// Usage: node cdp-eval.js "<js expression>"
const targetWs = "ws://127.0.0.1:9222/devtools/page/1C50B28473B572503B718641AF62E80F";

const expr = process.argv[2];
if (!expr) { console.error("Usage: node cdp-eval.js \"<expr>\""); process.exit(1); }

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
    // Enable Runtime to capture console messages
    await send("Runtime.enable");
    const result = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      console.error("EXCEPTION:", JSON.stringify(result.exceptionDetails, null, 2));
    } else {
      console.log(JSON.stringify(result.result.value, null, 2));
    }
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
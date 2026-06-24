// CDP helper: run a sequence of actions on the options page.
// Actions: "eval:<expr>", "click:<selector>", "set:<selector>|<value>", "wait:<ms>"
// Usage: node cdp-actions.js "action1" "action2" ...
const targetWs = "ws://127.0.0.1:9222/devtools/page/1C50B28473B572503B718641AF62E80F";

const actions = process.argv.slice(2);
if (actions.length === 0) { console.error("Usage: node cdp-actions.js \"eval:...\" \"click:...\" ..."); process.exit(1); }

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

async function evalJS(expr) {
  const result = await send("Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    return { __exception: true, details: result.exceptionDetails };
  }
  return result.result.value;
}

// Helper JS to click by selector
const clickScript = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'NOT_FOUND'; el.click(); return 'CLICKED'; })()`;
// Helper JS to set value by selector
const setScript = (sel, val) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'NOT_FOUND'; el.value = ${JSON.stringify(val)}; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); return 'SET'; })()`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

ws.addEventListener("open", async () => {
  try {
    await send("Runtime.enable");
    for (const action of actions) {
      if (action.startsWith("eval:")) {
        const expr = action.slice(5);
        const r = await evalJS(expr);
        console.log("EVAL:", JSON.stringify(r, null, 2));
      } else if (action.startsWith("click:")) {
        const sel = action.slice(6);
        const r = await evalJS(clickScript(sel));
        console.log("CLICK", sel, "->", JSON.stringify(r));
      } else if (action.startsWith("set:")) {
        const [sel, ...rest] = action.slice(4).split("|");
        const val = rest.join("|");
        const r = await evalJS(setScript(sel, val));
        console.log("SET", sel, "->", JSON.stringify(r));
      } else if (action.startsWith("wait:")) {
        const ms = parseInt(action.slice(5), 10);
        await sleep(ms);
        console.log("WAIT", ms, "ms");
      } else {
        console.log("UNKNOWN:", action);
      }
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
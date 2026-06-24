// CDP helper: capture console messages and exceptions during page load.
// Reloads the page, captures console events for 3 seconds, then prints them.
const targetWs = "ws://127.0.0.1:9222/devtools/page/1C50B28473B572503B718641AF62E80F";

const ws = new WebSocket(targetWs);
let id = 0;
const pending = new Map();
const consoleMessages = [];
const exceptions = [];

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

ws.addEventListener("open", async () => {
  try {
    await send("Runtime.enable");
    await send("Log.enable");
    // Reload the page to capture console output during load
    await send("Page.enable");
    await send("Page.reload", { ignoreCache: false });

    // Wait 3 seconds for console messages
    await new Promise(r => setTimeout(r, 3000));

    console.log("=== CONSOLE API MESSAGES ===");
    console.log(JSON.stringify(consoleMessages, null, 2));
    console.log("=== UNCAUGHT EXCEPTIONS ===");
    console.log(JSON.stringify(exceptions, null, 2));
    console.log("=== SUMMARY ===");
    console.log(`Console messages: ${consoleMessages.length}, Exceptions: ${exceptions.length}`);

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
  } else if (msg.method === "Runtime.consoleAPICalled") {
    consoleMessages.push({
      type: msg.params.type,
      args: msg.params.args.map(a => a.value || a.description || a.type),
      stackTrace: msg.params.stackTrace ? msg.params.stackTrace.callFrames.map(f => f.functionName + "@" + f.url + ":" + f.lineNumber) : null
    });
  } else if (msg.method === "Runtime.exceptionThrown") {
    exceptions.push({
      text: msg.params.exceptionDetails.text,
      description: msg.params.exceptionDetails.exception ? msg.params.exceptionDetails.exception.description : null,
      url: msg.params.exceptionDetails.url,
      lineNumber: msg.params.exceptionDetails.lineNumber,
      columnNumber: msg.params.exceptionDetails.columnNumber
    });
  } else if (msg.method === "Log.entryAdded") {
    consoleMessages.push({
      type: "Log",
      level: msg.params.entry.level,
      text: msg.params.entry.text,
      source: msg.params.entry.source
    });
  }
});

ws.addEventListener("error", (e) => { console.error("WS ERROR:", e.message || e); process.exit(1); });
ws.addEventListener("close", () => { process.exit(0); });
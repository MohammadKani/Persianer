// CDP helper for async expressions that need to await promises
// Usage: node test-cdp-async.mjs <tabId> <expression>
import WebSocket from 'ws';

const tabId = process.argv[2];
const expression = process.argv[3];

if (!tabId || !expression) {
  console.error('Usage: node test-cdp-async.mjs <tabId> <expression>');
  process.exit(1);
}

const wsUrl = `ws://127.0.0.1:9222/devtools/page/${tabId}`;
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  // Use Runtime.evaluate with awaitPromise
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(async () => { ${expression} })()`,
      returnByValue: true,
      awaitPromise: true
    }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id === 1) {
    if (msg.result?.result?.value !== undefined) {
      console.log(JSON.stringify(msg.result.result.value, null, 2));
    } else if (msg.result?.exceptionDetails) {
      console.error('EXCEPTION:', msg.result.exceptionDetails.text);
      if (msg.result.exceptionDetails.exception?.description) {
        console.error(msg.result.exceptionDetails.exception.description);
      }
    } else {
      console.log(JSON.stringify(msg.result, null, 2));
    }
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err.message);
  process.exit(1);
});

ws.on('close', () => {
  process.exit(0);
});

setTimeout(() => {
  console.error('Timeout waiting for response');
  process.exit(1);
}, 15000);
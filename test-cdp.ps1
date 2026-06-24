# CDP helper to evaluate JS on a page and return the result
param(
    [string]$TabId,
    [string]$Expression
)

Add-Type -AssemblyName System.Net.WebSockets
Add-Type -AssemblyName System.Text

$wsUrl = "ws://127.0.0.1:9222/devtools/page/$TabId"
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ct = New-Object System.Threading.CancellationTokenSource
$ct.CancelAfter([TimeSpan]::FromSeconds(15))

$connectTask = $ws.ConnectAsync([Uri]$wsUrl, $ct.Token)
while (-not $connectTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
if ($ws.State -ne [Net.WebSockets.WebSocketState]::Open) {
    Write-Host "ERROR: WebSocket not connected, state: $($ws.State)"
    exit 1
}

# Send Runtime.evaluate
$msg = @{ id = 1; method = "Runtime.evaluate"; params = @{ expression = $Expression; returnByValue = $true } } | ConvertTo-Json -Depth 5 -Compress
$bytes = [Text.Encoding]::UTF8.GetBytes($msg)
$sendTask = $ws.SendAsync($bytes, [Net.WebSockets.WebSocketMessageType]::Text, $true, $ct.Token)
while (-not $sendTask.IsCompleted) { Start-Sleep -Milliseconds 50 }

# Receive response
$buffer = New-Object byte[] 131072
$receiveTask = $ws.ReceiveAsync($buffer, $ct.Token)
while (-not $receiveTask.IsCompleted) { Start-Sleep -Milliseconds 50 }
$response = [Text.Encoding]::UTF8.GetString($buffer, 0, $receiveTask.Result.Count)

# Parse and print just the result value
try {
    $json = $response | ConvertFrom-Json
    if ($json.result.result.value) {
        Write-Output $json.result.result.value
    } elseif ($json.result.exceptionDetails) {
        Write-Host "EXCEPTION: $($json.result.exceptionDetails.text)"
        if ($json.result.exceptionDetails.exception) {
            Write-Host "  $($json.result.exceptionDetails.exception.description)"
        }
    } else {
        Write-Host "RAW: $response"
    }
} catch {
    Write-Host "PARSE ERROR: $response"
}

$ws.Dispose()
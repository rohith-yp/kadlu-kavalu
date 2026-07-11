# Remove orphaned lighthouse code block from app.js
# Lines 1237 to 1654 (0-indexed: 1236 to 1653) are the junk
$file = 'C:\Users\Rohith\OneDrive\Desktop\mock\app.js'
$lines = Get-Content $file

# Keep lines 0..1235 and 1654..end (0-indexed)
$cleaned = $lines[0..1235] + $lines[1654..($lines.Count - 1)]

Set-Content -Path $file -Value $cleaned -Encoding UTF8
Write-Host "Done. Lines before: $($lines.Count), Lines after: $($cleaned.Count)"

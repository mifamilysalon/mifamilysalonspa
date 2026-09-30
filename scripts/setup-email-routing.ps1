# After verifying Familysalonspa@gmail.com in the Cloudflare email,
# run:  powershell -File scripts/setup-email-routing.ps1
$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "b51ded38b292d1a89fdd26e99e1bb7e9"
$config = "wrangler.mifamilysalon.jsonc"
$dest = "Familysalonspa@gmail.com"

Write-Host "Destination addresses:"
npx wrangler email routing addresses list --config $config

$addrs = @(
  "appointments@mifamilysalon.com",
  "gifts@mifamilysalon.com",
  "info@mifamilysalon.com",
  "admin@mifamilysalon.com",
  "support@mifamilysalon.com"
)

foreach ($a in $addrs) {
  $local = ($a -split "@")[0]
  Write-Host "Creating rule for $a ..."
  npx wrangler email routing rules create mifamilysalon.com `
    --config $config `
    --name "Forward $local to Gmail" `
    --match-type literal `
    --match-field to `
    --match-value $a `
    --action-type forward `
    --action-value $dest `
    --enabled true
}

Write-Host "Enabling catch-all ..."
npx wrangler email routing rules update mifamilysalon.com catch-all `
  --config $config `
  --action-type forward `
  --action-value $dest `
  --enabled true

Write-Host "Rules:"
npx wrangler email routing rules list mifamilysalon.com --config $config

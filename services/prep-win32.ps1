Param(
  [switch]$DOREMOVE = $False
)

# in services directory find all folder called darwin, linux, windows and remove if the do not patch the os_type
Get-ChildItem -Path .\ -Directory -Recurse -Filter darwin | ForEach-Object {
    $dir = $_.FullName
    if ($DOREMOVE) {
      Write-Host "Removing $dir"
      Remove-Item -Path $dir -Recurse -Force
    }
}

Get-ChildItem -Path .\ -Directory -Recurse -Filter linux | ForEach-Object {
  $dir = $_.FullName
  if ($DOREMOVE) {
    Write-Host "Removing $dir"
    Remove-Item -Path $dir -Recurse -Force
  }
}

# find file that has -darwin- in the name and remove them
Get-ChildItem -Path .\ -File -Recurse -Filter "*-darwin-*" | ForEach-Object {
  $file = $_.FullName
  if ($DOREMOVE) {
    Write-Host "Removing $file"
    Remove-Item -Path $file -Force
  }
}

# find file that has -darwin- in the name and remove them
Get-ChildItem -Path .\ -File -Recurse -Filter "*-linux-*" | ForEach-Object {
  $file = $_.FullName
  if ($DOREMOVE) {
    Write-Host "Removing $file"
    Remove-Item -Path $file -Force
  }
}

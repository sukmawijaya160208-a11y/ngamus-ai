$d=Get-Date -Format yyyy-MM-dd
$f="C:\Users\Lenovo Premium\Desktop\ngampus-ai\docs\vault\daily\$d.md"
if(!(Test-Path $f)){
  $t=Get-Content "C:\Users\Lenovo Premium\Desktop\ngampus-ai\docs\vault\templates\daily.md" -Raw
  $t=$t -replace '\{\{date:YYYY-MM-DD\}\}',$d -replace '\{\{date:dddd\}\}',(Get-Date -Format dddd) -replace '\{\{time\}\}',(Get-Date -Format HH:mm) -replace '\{\{date:YYYY-MM-DD:-1d\}\}',(Get-Date).AddDays(-1).ToString('yyyy-MM-dd') -replace '\{\{date:YYYY-MM-DD:\+1d\}\}',(Get-Date).AddDays(1).ToString('yyyy-MM-dd')
  Set-Content $f $t -Encoding utf8
}

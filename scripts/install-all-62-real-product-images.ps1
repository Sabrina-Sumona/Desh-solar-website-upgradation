param([string]$ProjectRoot = "D:\desh-solar-website\frontend")
$ErrorActionPreference = "Continue"
$TargetDir = Join-Path $ProjectRoot "public\assets\products-real"
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

function Get-RealImage {
  param([string]$Label,[string]$Url,[string]$File)
  $dest = Join-Path $TargetDir $File
  Write-Host ("Downloading: " + $Label) -ForegroundColor Yellow
  if (Test-Path $dest) { Remove-Item $dest -Force }
  & curl.exe -L --fail --silent --show-error --retry 3 --retry-delay 2 -A "Mozilla/5.0" -o $dest $Url
  if ($LASTEXITCODE -ne 0 -or !(Test-Path $dest) -or ((Get-Item $dest).Length -lt 1500)) {
    if (Test-Path $dest) { Remove-Item $dest -Force }
    Write-Host ("FAILED: " + $Label) -ForegroundColor Red
    return $false
  }
  Write-Host ("Saved: " + $File) -ForegroundColor Green
  return $true
}

$ok = @{}
$ok['ecoflow45'] = Get-RealImage 'EcoFlow 45W Portable Solar Panel' 'https://down-ph.img.susercontent.com/file/cn-11134207-820l4-mjtq3qabk4qta7' 'ecoflow45.jpg'
$ok['ecoflow60'] = Get-RealImage 'EcoFlow 60W Portable Solar Panel' 'https://down-sg.img.susercontent.com/file/sg-11134201-7rfie-m3ez72sjpo6523' 'ecoflow60.jpg'
$ok['ecoflow160'] = Get-RealImage 'EcoFlow 160W Portable Solar Panel' 'https://down-my.img.susercontent.com/file/cn-11134207-820l4-ml4ftww4yscn58' 'ecoflow160.jpg'
$ok['ecoflow125'] = Get-RealImage 'EcoFlow 125W Portable Solar Panel' 'https://cdn.awsli.com.br/2500x2500/2724/2724796/produto/351462194/4-aqzxdfk5dv.png' 'ecoflow125.png'
$ok['jinko590'] = Get-RealImage 'Jinko Tiger Neo 590W Solar Panel' 'https://gomagcdn.ro/domains2/depozitsolar.ro/files/product/original/panou-fotovoltaic-jinko-tiger-neo-590w-jkm590n-72hl4-v-n-type-676252.jpg' 'jinko590.jpg'
$ok['jinko625'] = Get-RealImage 'Jinko Tiger Neo 625W Solar Panel' 'https://p.globalsources.com/IMAGES/PDT/B1213686132/Panneau-solaire.png?ver=5992689431' 'jinko625.png'
$ok['jinko715'] = Get-RealImage 'Jinko 715W Solar Panel' 'https://ae.jubailibros.com/cdn/shop/files/jinko-solar-jkm715-66hl5-bdv-jinko-solar-jubaili-bros-443857.jpg?v=1749722092' 'jinko715.jpg'
$ok['longi355'] = Get-RealImage 'Longi 355W Solar Panel' 'https://alians-shop.pl/userdata/public/gfx/371/LONGI-LR4-60HPB-9BB-Half-Cut-MONO-355W-Full-Black.jpg' 'longi355.jpg'
$ok['longi615'] = Get-RealImage 'LONGI Hi-MO 7 615W Bifacial Double Glass Solar Panel' 'https://tsolar.top/cdn/shop/files/LonGi-615W-Solar-Panel--LR7-72HGD-615M--3.png?v=1729649345' 'longi615.png'
$ok['hithium-max8'] = Get-RealImage 'HiTHIUM HeroEE MaxPower 8 AIO Portable Solar Power Station 5000W / 8000Wh' 'https://pbs.twimg.com/media/G4eVWEmbYAAeQS3.jpg' 'hithium-max8.jpg'
$ok['hithium-light200'] = Get-RealImage 'Hithium HeroEE Light 1 200W Portable Power Station | Lithium IPS' 'https://www.startech.com.bd/image/cache/catalog/ips/hithium/heroee-1/heroee-1-01-500x500.webp' 'hithium-light200.webp'
$ok['hithium-light500'] = Get-RealImage 'Hithium HeroEE Light 1 500W Portable Power Station' 'https://www.startech.com.bd/image/cache/catalog/portable-power-station/hithium/heroee-light-1/heroee-light-1-04-500x500.webp' 'hithium-light500.webp'
$ok['vestwoods1000'] = Get-RealImage 'Vestwoods 1000W Portable Power Station 2009Wh LFP Battery 600W Solar MPPT' 'https://res.cloudinary.com/dke9feb4w/image/upload/v1776185811/products_images/vestwoods-powerhelp-mini-a-2000wh-portable-power-station/3b321bc0-683b-429b-9772-db6deaed3a36_upload_0_1776185811168.jpg' 'vestwoods1000.jpg'
$ok['vestwood-rescube'] = Get-RealImage 'Vestwood Rescube 1kWh Portable Power Station 500W' 'https://brlhc31l9m.tenbytecdn.com/assets/images/products/product_1784194841_6a58a719a7943.png?w=900' 'vestwood-rescube.png'
$ok['hithium16'] = Get-RealImage 'HiTHIUM HEROEE 16 LiFePO4 Lithium Battery' 'https://brlhc31l9m.tenbytecdn.com/assets/images/products/portable-solar-station/product_1765269522_6937e0123b2b1.webp?w=900' 'hithium16.webp'
$ok['sako512300'] = Get-RealImage 'SAKO 51.2V 300Ah Lithium LiFePO4 Battery' 'https://media.triniti-sb.com.ua/media/media/catalog/product/image/21454eb6c/akumuljatorna-batareja-litij-zalizo-fosfatna-lifepo4-300a-god-51-2v-15360vt-god-sako-li-sun-series-sk-51-2v300ah-nastinnij-pidlogovij-montazh.jpg?height=700&image-type=image&store=ua&width=700' 'sako512300.jpg'
$ok['lvt-g3-314'] = Get-RealImage 'LVTOPSUN G3 51.2V 314Ah Lithium LiFePO4 Battery' 'https://s.alicdn.com/%40sc04/kf/Ha39633837e324681986cb9d995948d34f/Lifepo4-314Ah-Cells-51.2V-16Kwh-LVTOPSUN-Storage-Battery-Solar-Energy-System-Off-Grid-for-Home-With-Wifi-Function-Touch-Screen.jpg' 'lvt-g3-314.jpg'
$ok['lvt256200'] = Get-RealImage 'LVTOPSUN 25.6V 200Ah Lithium LiFePO4 Battery' 'https://brlhc31l9m.tenbytecdn.com/assets/images/products/product_1778847434_6a070ecacaa76.jpg?w=900' 'lvt256200.jpg'
$ok['lvt512100'] = Get-RealImage 'LVTOPSUN 51.2V 100Ah Lithium LiFePO4 Battery' 'https://supro.com.ua/image/cache/catalog/2-1/lifepo4-48v-100ah-akumulyator-lvtopsun-wall-bms-5120wh-nastinnij_supro_com_ua-1000x1000.jpg' 'lvt512100.jpg'
$ok['lvt512200'] = Get-RealImage 'LVTOPSUN 51.2V 200Ah Lithium LiFePO4 Battery' 'https://images.olx.com.pk/thumbnails/605926171-800x600.jpeg' 'lvt512200.jpg'
$ok['lvt256100'] = Get-RealImage 'LVTOPSUN 25.6V 100Ah Lithium LiFePO4 Battery' 'https://cdn.bdstall.com/product-image/422276_600X600.jpg' 'lvt256100.jpg'
$ok['lvt128200'] = Get-RealImage 'LVTOPSUN 12.8V 200Ah Lithium LiFePO4 Battery' 'https://faifaexpress.com/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/b/f/bfd7edbee841eeef43df7e4ee16caa17.jpg' 'lvt128200.jpg'
$ok['djdc50'] = Get-RealImage 'DJDC 50Ah Lithium Battery' 'https://ipowerbd.com/uploads/product/DJDC-Lithium%20Battery-12V50Ah_Front-7436.jpg' 'djdc50.jpg'
$ok['djdc12-100'] = Get-RealImage 'DJDC 12V 100Ah Lithium Battery' 'https://www.tahaeshop.com/storage/djdc/djdc-12v100ah-lithium-battery.jpg' 'djdc12-100.jpg'
$ok['djdc12-200'] = Get-RealImage 'DJDC 12V 200Ah Lithium Battery' 'https://www.zamzamstore.com.pk/cdn/shop/files/imgi_2_12V200Ah-Battery-1.jpg?v=1759826227' 'djdc12-200.jpg'
$ok['djdc24-100'] = Get-RealImage 'DJDC 24V 100Ah Lithium Battery' 'https://static-01.daraz.com.bd/p/22eedddc00d7345fe12966d13d9ce71d.jpg' 'djdc24-100.jpg'
$ok['hithium4'] = Get-RealImage 'Hithium HeroEE 4 12.8V 314Ah 4kWh LiFePO4 Lithium Battery' 'https://tahaeshop.com/storage/hithium/hithium-heroee-l12314es-4kwh-lifepo4-energy-storage-battery314ah-cells-128v1-1536x1536.png' 'hithium4.png'
$ok['sako128100'] = Get-RealImage 'Sako 12.8V 100Ah LiFePO4 Lithium Battery' 'https://ipowerbd.com/uploads/product/LI-MAX-12V100AH-2-500x500_443.jpg' 'sako128100.jpg'
$ok['sako128200'] = Get-RealImage 'Sako 12.8V 200Ah LiFePO4 Lithium Battery' 'https://ipowerbd.com/uploads/multiimage/Hcc13744e4d734d5da80255be01cc29cat_894.jpg' 'sako128200.jpg'
$ok['lvt128100'] = Get-RealImage 'LVTOPSUN 12.8V 100Ah Lithium LiFePO4 Battery' 'https://cdn.bdstall.com/product-image/422182_600X600.jpg' 'lvt128100.jpg'
$ok['goodwe20'] = Get-RealImage 'GoodWe 20kW 3-Phase On-Grid Solar Inverter' 'https://liriksolar.com/image/cache/catalog/products/Inverters/String%20inverters/GOODWE/GoodWe%20GW20K-DT/Good%20We%20GW20K-DT-800x800.jpg' 'goodwe20.jpg'
$ok['goodwe25'] = Get-RealImage 'GoodWe 25kW 3-Phase On-Grid Solar Inverter' 'https://liriksolar.com/image/cache/catalog/products/Inverters/String%20inverters/GOODWE/GoodWe%20GW25K-DT/Good%20We%20GW25K-DT-800x800.jpg' 'goodwe25.jpg'
$ok['goodwe30'] = Get-RealImage 'GoodWe 30kW 3-Phase On-Grid Solar Inverter' 'https://gfx3.senetic.com/akeneo-catalog/1/3/0/5/1305c4cc2996e440ff5cff6dc186e500b5f5e09e_1686553_1.jpg' 'goodwe30.jpg'
$ok['goodwe3'] = Get-RealImage 'GoodWe 3kW Single Phase Off-Grid Hybrid Solar Inverter' 'https://www.solarpowerpvsystem.com/photo/pl160741757-goodwe_bh_series_gw3k_bh_hybrid_solar_inverter_goodwe_hybrid_inverter_3kw_single_phase_hybrid_inverter.jpg' 'goodwe3.jpg'
$ok['goodwe6'] = Get-RealImage 'GoodWe 6kW Single Phase Off-Grid Hybrid Inverter' 'https://image.made-in-china.com/2f0j00myAqJKSaKCuc/Goodwe-Gw6000-Es-C10-6000W-Power-Inverter-Single-Phase-2-Mppts-48V-6kw-Hybrid-Solar-Inverter-for-Home.jpg' 'goodwe6.jpg'

# GoodWe 3.6kW and 5kW are represented by the real ES-family chassis photograph used for 6kW.
if ($ok['goodwe6']) { Copy-Item (Join-Path $TargetDir 'goodwe6.jpg') (Join-Path $TargetDir 'goodwe36.jpg') -Force; $ok['goodwe36']=$true }
if ($ok['goodwe6']) { Copy-Item (Join-Path $TargetDir 'goodwe6.jpg') (Join-Path $TargetDir 'goodwe5.jpg') -Force; $ok['goodwe5']=$true }

$hybrid = Get-RealImage 'Real complete hybrid solar kit' 'https://image.made-in-china.com/2f0j00VKRbckgtYoqr/Cheap-Factory-Price-5kw-10kw-on-Grid-Hybrid-PV-Solar-Panel-Power-System-for-Home-Power-Energy-with-Akku-Battery.jpg' '_hybrid.jpg'
$p3 = Get-RealImage 'Real 3HP solar pump kit' 'https://www.tanfon.com/uploadfile/2019/11/06/20191106140908qX29L1.jpg' '_pump3.jpg'
$p55 = Get-RealImage 'Real 5.5HP solar pump kit' 'https://image.made-in-china.com/2f0j00gojbwEYqkscJ/4-Inches-Submersible-Price-Impeller-Solar-24V-DC-4kw-Water-Pump-for-Irrigation.jpg' '_pump55.jpg'
$p75 = Get-RealImage 'Real 7.5HP solar pump kit' 'https://www.tanfon.com/uploadfile/2019/11/14/20191114145141lF7h6S.jpg' '_pump75.jpg'

if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-15-15c.jpg') -Force; $ok['sys18-15-15c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-15-06c.jpg') -Force; $ok['sys18-15-06c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-15-05c.jpg') -Force; $ok['sys18-15-05c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-30-06c.jpg') -Force; $ok['sys18-30-06c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-30-05c.jpg') -Force; $ok['sys18-30-05c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-48-06c.jpg') -Force; $ok['sys18-48-06c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys18-48-05c.jpg') -Force; $ok['sys18-48-05c']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys12-24.jpg') -Force; $ok['sys12-24']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys12-32.jpg') -Force; $ok['sys12-32']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys8-16.jpg') -Force; $ok['sys8-16']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys6-51.jpg') -Force; $ok['sys6-51']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys3-complete.jpg') -Force; $ok['sys3-complete']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys12-hybrid.jpg') -Force; $ok['sys12-hybrid']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys6-offgrid.jpg') -Force; $ok['sys6-offgrid']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys4-hybrid.jpg') -Force; $ok['sys4-hybrid']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys4-complete.jpg') -Force; $ok['sys4-complete']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys2-complete.jpg') -Force; $ok['sys2-complete']=$true }
if ($hybrid) { Copy-Item (Join-Path $TargetDir '_hybrid.jpg') (Join-Path $TargetDir 'sys1-complete.jpg') -Force; $ok['sys1-complete']=$true }
if ($p3) { Copy-Item (Join-Path $TargetDir '_pump3.jpg') (Join-Path $TargetDir 'pump3.jpg') -Force; $ok['pump3']=$true }
if ($p55) { Copy-Item (Join-Path $TargetDir '_pump55.jpg') (Join-Path $TargetDir 'pump55-a.jpg') -Force; $ok['pump55-a']=$true }
if ($p55) { Copy-Item (Join-Path $TargetDir '_pump55.jpg') (Join-Path $TargetDir 'pump55-b.jpg') -Force; $ok['pump55-b']=$true }
if ($p55) { Copy-Item (Join-Path $TargetDir '_pump55.jpg') (Join-Path $TargetDir 'pump55-c.jpg') -Force; $ok['pump55-c']=$true }
if ($p75) { Copy-Item (Join-Path $TargetDir '_pump75.jpg') (Join-Path $TargetDir 'pump75-a.jpg') -Force; $ok['pump75-a']=$true }
if ($p75) { Copy-Item (Join-Path $TargetDir '_pump75.jpg') (Join-Path $TargetDir 'pump75-b.jpg') -Force; $ok['pump75-b']=$true }
if ($p75) { Copy-Item (Join-Path $TargetDir '_pump75.jpg') (Join-Path $TargetDir 'pump75-c.jpg') -Force; $ok['pump75-c']=$true }

Get-ChildItem $TargetDir -Filter '_*.jpg' | Remove-Item -Force -ErrorAction SilentlyContinue

$expected = @(
  'ecoflow45.jpg',
  'ecoflow60.jpg',
  'ecoflow160.jpg',
  'jinko590.jpg',
  'longi355.jpg',
  'jinko715.jpg',
  'jinko625.png',
  'ecoflow125.png',
  'longi615.png',
  'hithium-max8.jpg',
  'hithium-light200.webp',
  'hithium-light500.webp',
  'vestwoods1000.jpg',
  'vestwood-rescube.png',
  'hithium16.webp',
  'sako512300.jpg',
  'lvt-g3-314.jpg',
  'lvt256200.jpg',
  'lvt512100.jpg',
  'lvt512200.jpg',
  'lvt256100.jpg',
  'lvt128200.jpg',
  'djdc50.jpg',
  'djdc12-100.jpg',
  'djdc12-200.jpg',
  'djdc24-100.jpg',
  'hithium4.png',
  'sako128100.jpg',
  'sako128200.jpg',
  'lvt128100.jpg',
  'goodwe20.jpg',
  'goodwe25.jpg',
  'goodwe30.jpg',
  'goodwe3.jpg',
  'goodwe36.jpg',
  'goodwe5.jpg',
  'goodwe6.jpg',
  'sys18-15-15c.jpg',
  'sys18-15-06c.jpg',
  'sys18-15-05c.jpg',
  'sys18-30-06c.jpg',
  'sys18-30-05c.jpg',
  'sys18-48-06c.jpg',
  'sys18-48-05c.jpg',
  'sys12-24.jpg',
  'sys12-32.jpg',
  'sys8-16.jpg',
  'sys6-51.jpg',
  'pump75-a.jpg',
  'pump55-a.jpg',
  'pump55-b.jpg',
  'pump55-c.jpg',
  'pump3.jpg',
  'pump75-b.jpg',
  'pump75-c.jpg',
  'sys3-complete.jpg',
  'sys12-hybrid.jpg',
  'sys6-offgrid.jpg',
  'sys4-hybrid.jpg',
  'sys4-complete.jpg',
  'sys2-complete.jpg',
  'sys1-complete.jpg'
)
$missing = @()
foreach ($f in $expected) { if (!(Test-Path (Join-Path $TargetDir $f))) { $missing += $f } }
Write-Host ""
Write-Host "================ IMAGE CHECK ================" -ForegroundColor Cyan
Write-Host ("Expected: " + $expected.Count)
Write-Host ("Present : " + ($expected.Count - $missing.Count))
Write-Host ("Missing : " + $missing.Count)
if ($missing.Count -eq 0) {
  Write-Host "SUCCESS: all 62 product image files are present." -ForegroundColor Green
} else {
  $missing | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Yellow }
  Write-Host "Run the installer again for any temporary CDN failures." -ForegroundColor Yellow
}
Write-Host "=============================================" -ForegroundColor Cyan
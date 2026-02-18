param(
  [string]$Root = 'images/Stickers',
  [string]$OutFile = 'js/data.js',
  [int]$Precio = 700
)

$ErrorActionPreference = 'Stop'

function Normalize-Slug([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return 'general' }
  $value = $text.ToLowerInvariant()
  $map = @{
    'á'='a'; 'à'='a'; 'ä'='a'; 'â'='a'
    'é'='e'; 'è'='e'; 'ë'='e'; 'ê'='e'
    'í'='i'; 'ì'='i'; 'ï'='i'; 'î'='i'
    'ó'='o'; 'ò'='o'; 'ö'='o'; 'ô'='o'
    'ú'='u'; 'ù'='u'; 'ü'='u'; 'û'='u'
    'ñ'='n'
  }
  foreach ($k in $map.Keys) { $value = $value.Replace($k, $map[$k]) }
  $value = $value -replace '[^a-z0-9]+', '-'
  $value = $value.Trim('-')
  if ([string]::IsNullOrWhiteSpace($value)) { return 'general' }
  return $value
}

function Escape-Js([string]$text) {
  $safe = $text.Replace('\\', '/')
  $safe = $safe.Replace("'", "\'")
  return $safe
}

if (-not (Test-Path $Root)) {
  throw "No existe la carpeta raiz: $Root"
}

$allowed = @('.png', '.jpg', '.jpeg', '.webp', '.avif')
$files = Get-ChildItem -Path $Root -Recurse -File |
  Where-Object { $allowed -contains $_.Extension.ToLowerInvariant() } |
  Sort-Object FullName

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('// Archivo generado automaticamente. No editar a mano.')
$lines.Add('const productos = [')

$index = 1
foreach ($f in $files) {
  $rel = $f.FullName.Substring((Resolve-Path $Root).Path.Length).TrimStart('\\')
  $parts = $rel -split '\\'

  $categoriaPrincipalLabel = if ($parts.Length -ge 2) { $parts[0] } else { 'General' }
  $subcategoriaLabel = if ($parts.Length -ge 3) { $parts[1] } else { 'General' }

  $categoriaPrincipal = Normalize-Slug $categoriaPrincipalLabel
  $subcategoria = Normalize-Slug $subcategoriaLabel

  $nombreBase = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
  $nombre = "Sticker $nombreBase"

  $id = ('ST-{0}-{1:0000}' -f ($categoriaPrincipal.Substring(0, [Math]::Min(3, $categoriaPrincipal.Length)).ToUpperInvariant()), $index)

  $imagen = ('images/Stickers/' + ($rel -replace '\\', '/'))

  $line = "  {{ id: '{0}', nombre: '{1}', categoria: '{2}', categoriaLabel: '{3}', categoriaPrincipal: '{4}', categoriaPrincipalLabel: '{5}', subcategoria: '{6}', subcategoriaLabel: '{7}', tipo: 'sticker', precio: {8}, imagen: '{9}' }}," -f @(
    (Escape-Js $id),
    (Escape-Js $nombre),
    (Escape-Js $categoriaPrincipal),
    (Escape-Js $categoriaPrincipalLabel),
    (Escape-Js $categoriaPrincipal),
    (Escape-Js $categoriaPrincipalLabel),
    (Escape-Js $subcategoria),
    (Escape-Js $subcategoriaLabel),
    $Precio,
    (Escape-Js $imagen)
  )

  $lines.Add($line)
  $index++
}

if ($files.Count -gt 0) {
  $last = $lines[$lines.Count - 1]
  if ($last.EndsWith(',')) { $lines[$lines.Count - 1] = $last.TrimEnd(',') }
}

$lines.Add('];')
$lines.Add('')
$lines.Add('window.productos = productos;')

Set-Content -Path $OutFile -Value $lines -Encoding utf8
Write-Host "Generado: $OutFile ($($files.Count) items)"
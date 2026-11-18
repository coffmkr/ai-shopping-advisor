#!/usr/bin/env bash
# Hook PreToolUse de Claude Code: impide que el agente lea, edite o suba secretos.
# Bloquea .env* (salvo .env.example), secrets/, *.pem y *.key en herramientas de ficheros y en comandos de shell.
# Sale con código 2 para bloquear: Claude Code muestra el mensaje de stderr al agente.

set -euo pipefail

input="$(cat)"

tool_name="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_name||"")}catch{}})')"
target="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const i=JSON.parse(s).tool_input||{};process.stdout.write([i.file_path,i.path,i.pattern,i.command].filter(Boolean).join("\n"))}catch{}})')"

[ -z "$target" ] && exit 0

# Quita las menciones permitidas antes de buscar las prohibidas.
cleaned="$(printf '%s' "$target" | sed -E 's/\.env\.example//g')"

if printf '%s' "$cleaned" | grep -Eq '(^|[^A-Za-z0-9_])\.env([^A-Za-z0-9_]|$)|\.env\.[A-Za-z0-9_]+|(^|[^A-Za-z0-9_-])secrets(/|[[:space:]]|$)|\.pem([^A-Za-z0-9_]|$)|\.key([^A-Za-z0-9_]|$)'; then
  echo "Bloqueado por protect-secrets ($tool_name): no se permite acceder a .env, secrets/ ni llaves. Usa .env.example para documentar variables." >&2
  exit 2
fi

exit 0

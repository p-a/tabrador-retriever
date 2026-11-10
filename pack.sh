#!/bin/sh
# Builds dist/tabrador-<version>.zip for the Chrome Web Store.
set -e
cd "$(dirname "$0")"
version=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
mkdir -p dist
rm -f "dist/tabrador-$version.zip"
zip -q -X "dist/tabrador-$version.zip" manifest.json background.js url-key.js icons/16.png icons/32.png icons/48.png icons/128.png
echo "dist/tabrador-$version.zip"

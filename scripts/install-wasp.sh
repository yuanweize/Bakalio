#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p .tools
if test -x .tools/wasp-bin && test -d .tools/data; then exit 0; fi
case "$(uname -s)-$(uname -m)" in
 Darwin-arm64) asset=wasp-macos-aarch64.tar.gz; checksum=3f41344ddc3ec1527bfb83b3b73d68af09efe5a9070f2eeb14f1f06f7a1c2942 ;;
 Darwin-x86_64) asset=wasp-macos-x86_64.tar.gz; checksum=4566357b71ab1c84aa6f2355c491fe701c659070e050be43b3bc267f39b4fdf2 ;;
 Linux-aarch64) asset=wasp-linux-aarch64.tar.gz; checksum=4c1121e5a0aaa8398045778bec69a4cca515852943865baffa9cff0591ced0d9 ;;
 Linux-x86_64) asset=wasp-linux-x86_64-static.tar.gz; checksum=955c27a1c64e42620ec276270a6f57fde485111b2084cd4074a8e29283f6ff4c ;;
 *) echo 'Unsupported platform. See https://wasp.sh/docs/quick-start' >&2; exit 1 ;;
esac
archive=".tools/$asset"
curl --fail --location --retry 3 "https://github.com/wasp-lang/wasp/releases/download/v0.26.1/$asset" -o "$archive"
if command -v sha256sum >/dev/null; then printf '%s  %s\n' "$checksum" "$archive" | sha256sum -c -; else printf '%s  %s\n' "$checksum" "$archive" | shasum -a 256 -c -; fi
tar xzf "$archive" -C .tools
rm "$archive"

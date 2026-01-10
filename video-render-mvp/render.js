import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "input");
const MEDIA_DIR = path.join(INPUT, "media");
const OUTPUT_DIR = path.join(ROOT, "output");
const OUTPUT = path.join(OUTPUT_DIR, "output.mp4");

const VOICE = path.join(INPUT, "voice.mp3");
const MUSIC = path.join(INPUT, "music.mp3");

// ===== validate =====
if (!fs.existsSync(VOICE)) {
  throw new Error("❌ Thiếu file input/voice.mp3");
}

const mediaFiles = fs
  .readdirSync(MEDIA_DIR)
  .filter(f => /\.(jpg|jpeg|png|mp4)$/i.test(f))
  .map(f => path.join(MEDIA_DIR, f));

if (mediaFiles.length === 0) {
  throw new Error("❌ input/media không có ảnh hoặc video");
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// ===== tạo list.txt =====
const listPath = path.join(INPUT, "list.txt");
const listContent = mediaFiles
  .map(f => `file '${path.resolve(f)}'`)
  .join("\n");

fs.writeFileSync(listPath, listContent);

// ===== ffmpeg =====
const hasMusic = fs.existsSync(MUSIC);

const cmd = `
ffmpeg -y \
-f concat -safe 0 -i "${listPath}" \
-i "${VOICE}" \
${hasMusic ? `-i "${MUSIC}"` : ""} \
-filter_complex "${hasMusic ? "[2:a]volume=0.15[m];[1:a][m]amix=inputs=2[a]" : ""}" \
-map 0:v \
-map ${hasMusic ? "[a]" : "1:a"} \
-r 30 \
-vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
-c:v libx264 -pix_fmt yuv420p \
-shortest \
"${OUTPUT}"
`;

console.log("🚀 Rendering video...");
execSync(cmd, { stdio: "inherit" });
console.log("✅ DONE:", OUTPUT);

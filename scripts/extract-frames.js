const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const initialsDir = path.join(__dirname, '..', 'public', 'videos', 'initials');
const finalsDir = path.join(__dirname, '..', 'public', 'videos', 'finals');
const outputDir = path.join(__dirname, '..', 'public', 'frames');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

// 检查 ffmpeg 是否安装
try {
  const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8' });
  console.log('✓ ffmpeg is installed');
} catch (e) {
  console.error('✗ ffmpeg is not installed. Please install ffmpeg first.');
  console.error('  Windows: choco install ffmpeg or download from https://ffmpeg.org/download.html');
  process.exit(1);
}

console.log('\n=== Extracting Initials End Frames ===\n');

// 提取声母尾帧
const initials = fs.readdirSync(initialsDir)
  .filter(f => f.endsWith('.mov'))
  .map(f => ({
    name: path.basename(f, '.mov'),
    videoPath: path.join(initialsDir, f)
  }));

initials.forEach(({ name, videoPath }) => {
  const outputPath = path.join(outputDir, `${name}_end.jpg`);
  try {
    // 提取最后一帧（倒数0.1秒处）
    execSync(`ffmpeg -y -i "${videoPath}" -sseof -0.1 -vframes 1 -q:v 2 "${outputPath}"`, { stdio: 'pipe' });
    console.log(`✓ Extracted ${name}_end.jpg`);
  } catch (e) {
    console.error(`✗ Failed ${name}: ${e.message}`);
  }
});

console.log('\n=== Extracting Finals Start Frames ===\n');

// 提取韵母首帧
const finals = fs.readdirSync(finalsDir)
  .filter(f => f.endsWith('.mp4'))
  .map(f => ({
    name: path.basename(f, '.mp4'),
    videoPath: path.join(finalsDir, f)
  }));

finals.forEach(({ name, videoPath }) => {
  const outputPath = path.join(outputDir, `${name}_start.jpg`);
  try {
    // 提取第1帧（0.05秒处，跳过可能的黑帧）
    execSync(`ffmpeg -y -i "${videoPath}" -ss 0.05 -vframes 1 -q:v 2 "${outputPath}"`, { stdio: 'pipe' });
    console.log(`✓ Extracted ${name}_start.jpg`);
  } catch (e) {
    console.error(`✗ Failed ${name}: ${e.message}`);
  }
});

console.log('\n=== Extraction Complete ===');
console.log(`Output directory: ${outputDir}`);
console.log(`Total initials: ${initials.length}`);
console.log(`Total finals: ${finals.length}`);
console.log(`Total frames extracted: ${initials.length + finals.length}`);

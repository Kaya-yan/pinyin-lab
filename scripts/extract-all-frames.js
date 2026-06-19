const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置路径
const initialsDir = path.join(__dirname, '..', 'public', 'videos', 'initials');
const finalsDir = path.join(__dirname, '..', 'public', 'videos', 'finals');
const outputDir = path.join(__dirname, '..', 'public', 'frames');
const ffmpegPath = 'C:\\Users\\ht\\Documents\\pinyinlab\\ffmpeg\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 清理旧文件
const oldFiles = fs.readdirSync(outputDir);
oldFiles.forEach(file => {
  fs.unlinkSync(path.join(outputDir, file));
});
console.log('Cleaned old frames\n');

console.log('=== Extracting Initials End Frames ===\n');

// 提取声母尾帧
const initials = fs.readdirSync(initialsDir)
  .filter(f => f.endsWith('.mov'))
  .map(f => ({
    name: path.basename(f, '.mov'),
    videoPath: path.join(initialsDir, f)
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

let successCount = 0;
let failCount = 0;

initials.forEach(({ name, videoPath }) => {
  const outputPath = path.join(outputDir, `initial_${name}_end.jpg`);
  try {
    execSync(`"${ffmpegPath}" -y -sseof -0.1 -i "${videoPath}" -frames:v 1 -q:v 2 -update 1 "${outputPath}"`, { stdio: 'pipe' });
    const stats = fs.statSync(outputPath);
    console.log(`✓ initial_${name}_end.jpg (${(stats.size / 1024).toFixed(1)} KB)`);
    successCount++;
  } catch (e) {
    console.error(`✗ Failed ${name}: ${e.message}`);
    failCount++;
  }
});

console.log(`\nInitials: ${successCount} success, ${failCount} failed\n`);

console.log('=== Extracting Finals Start Frames ===\n');

// 提取韵母首帧
const finals = fs.readdirSync(finalsDir)
  .filter(f => f.endsWith('.mp4'))
  .map(f => ({
    name: path.basename(f, '.mp4'),
    videoPath: path.join(finalsDir, f)
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

successCount = 0;
failCount = 0;

finals.forEach(({ name, videoPath }) => {
  const outputPath = path.join(outputDir, `final_${name}_start.jpg`);
  try {
    execSync(`"${ffmpegPath}" -y -ss 0.05 -i "${videoPath}" -frames:v 1 -q:v 2 -update 1 "${outputPath}"`, { stdio: 'pipe' });
    const stats = fs.statSync(outputPath);
    console.log(`✓ final_${name}_start.jpg (${(stats.size / 1024).toFixed(1)} KB)`);
    successCount++;
  } catch (e) {
    console.error(`✗ Failed ${name}: ${e.message}`);
    failCount++;
  }
});

console.log(`\nFinals: ${successCount} success, ${failCount} failed\n`);

// 生成汇总报告
const allFiles = fs.readdirSync(outputDir).sort();
console.log('=== Summary ===');
console.log(`Total frames extracted: ${allFiles.length}`);
console.log(`\nInitials (${initials.length}):`);
allFiles.filter(f => f.startsWith('initial_')).forEach(f => console.log(`  ${f}`));
console.log(`\nFinals (${finals.length}):`);
allFiles.filter(f => f.startsWith('final_')).forEach(f => console.log(`  ${f}`));

// 生成JSON索引文件
const frameIndex = {
  initials: initials.map(({ name }) => ({
    pinyin: name,
    file: `initial_${name}_end.jpg`,
    type: 'initial'
  })),
  finals: finals.map(({ name }) => ({
    pinyin: name,
    file: `final_${name}_start.jpg`,
    type: 'final'
  }))
};

fs.writeFileSync(
  path.join(outputDir, 'frame-index.json'),
  JSON.stringify(frameIndex, null, 2)
);
console.log('\n✓ Generated frame-index.json');

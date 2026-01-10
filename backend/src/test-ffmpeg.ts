import { exec } from 'child_process';

console.log('Testing FFmpeg...');

exec('ffmpeg -version', (err, stdout, stderr) => {
  if (err) {
    console.error('❌ FFMPEG ERROR');
    console.error(err);
    return;
  }

  console.log('✅ FFMPEG OK');
  console.log(stdout.split('\n')[0]);
});

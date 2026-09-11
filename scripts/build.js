const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Starting Unified Production Build ---');

// Build Vite from root config (points to frontend source and outputs to ./dist)
try {
  console.log('Building Vite bundle to ./dist ...');
  execSync('npx vite build', { stdio: 'inherit' });
} catch (err) {
  console.error('Root Vite build failed, attempting fallback via frontend prefix...', err);
  execSync('npm --prefix frontend run build', { stdio: 'inherit' });
  if (fs.existsSync(path.join(__dirname, '../frontend/dist'))) {
    fs.cpSync(path.join(__dirname, '../frontend/dist'), path.join(__dirname, '../dist'), { recursive: true });
  }
}

// Ensure both ./dist and ./frontend/dist exist and are identical
const distPath = path.join(__dirname, '../dist');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const backendStaticPath = path.join(__dirname, '../backend/static');

if (fs.existsSync(distPath)) {
  console.log('Mirroring ./dist to ./frontend/dist ...');
  fs.cpSync(distPath, frontendDistPath, { recursive: true });

  console.log('Mirroring ./dist to ./backend/static ...');
  fs.cpSync(distPath, backendStaticPath, { recursive: true });
}

console.log('--- Unified Production Build Complete ---');

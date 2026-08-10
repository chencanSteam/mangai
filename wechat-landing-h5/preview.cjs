const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('404:', req.url);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n满改平台 H5 预览已启动`);
  console.log(`请在浏览器打开: ${url}\n`);

  // Windows 下自动打开浏览器
  if (process.platform === 'win32') {
    const { exec } = require('child_process');
    exec(`start "" "${url}"`, () => {});
  }
});

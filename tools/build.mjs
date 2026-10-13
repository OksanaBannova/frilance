import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { transformFileSync } from '@babel/core';
const result = transformFileSync('script.js', {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  comments: false,
  compact: true
});
fs.writeFileSync('site.js', result.code + '\n');
const version = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
const html = fs.readFileSync('index.html', 'utf8')
  .replace(/src="site\.js(?:\?v=[^"]*)?"/, `src="site.js?v=${version('site.js')}"`)
  .replace(/href="style\.css(?:\?v=[^"]*)?"/, `href="style.css?v=${version('style.css')}"`);
fs.writeFileSync('index.html', html);
console.log('Compiled script.js → site.js');

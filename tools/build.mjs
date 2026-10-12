import fs from 'node:fs';
import { transformFileSync } from '@babel/core';
const result = transformFileSync('script.js', {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  comments: false,
  compact: true
});
fs.writeFileSync('site.js', result.code + '\n');
console.log('Compiled script.js → site.js');

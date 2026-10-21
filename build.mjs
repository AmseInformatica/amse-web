import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
for (const file of ['index.html', 'assets', '.htaccess', 'robots.txt', 'sitemap.xml']) cpSync(file, `dist/${file}`, { recursive: true });
const headers = [...readFileSync('.htaccess', 'utf8').matchAll(/Header always set ([\w-]+) "([^"]+)"/g)].map(m => `  ${m[1]}: ${m[2]}`).join('\n');
writeFileSync('dist/_headers', `/*\n${headers}\n`);

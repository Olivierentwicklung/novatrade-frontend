import { copyFileSync } from 'node:fs';

copyFileSync('development-server/data/db.fixture.json', 'development-server/data/db.json');

console.log('Development database reset.');

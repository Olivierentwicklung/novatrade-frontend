import { copyFileSync } from 'node:fs';

copyFileSync(
  'public/development_test_server/rest/db.fixture.json',
  'public/development_test_server/rest/db.json',
);

console.log('Development REST database reset.');

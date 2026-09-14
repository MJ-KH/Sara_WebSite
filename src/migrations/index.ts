import * as migration_20260914_170608_init from './20260914_170608_init';

export const migrations = [
  {
    up: migration_20260914_170608_init.up,
    down: migration_20260914_170608_init.down,
    name: '20260914_170608_init'
  },
];

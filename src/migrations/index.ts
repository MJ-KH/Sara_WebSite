import * as migration_20260914_170608_init from './20260914_170608_init';
import * as migration_20260930_135138_add_start_guide_about_blocks from './20260930_135138_add_start_guide_about_blocks';

export const migrations = [
  {
    up: migration_20260914_170608_init.up,
    down: migration_20260914_170608_init.down,
    name: '20260914_170608_init',
  },
  {
    up: migration_20260930_135138_add_start_guide_about_blocks.up,
    down: migration_20260930_135138_add_start_guide_about_blocks.down,
    name: '20260930_135138_add_start_guide_about_blocks'
  },
];

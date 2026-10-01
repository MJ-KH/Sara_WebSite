import * as migration_20260914_170608_init from './20260914_170608_init';
import * as migration_20260930_135138_add_start_guide_about_blocks from './20260930_135138_add_start_guide_about_blocks';
import * as migration_20260930_155604_hero_arch_images from './20260930_155604_hero_arch_images';
import * as migration_20260930_161600_structure_contact_course_fields from './20260930_161600_structure_contact_course_fields';
import * as migration_20261001_133425_spotplayer_license from './20261001_133425_spotplayer_license';

export const migrations = [
  {
    up: migration_20260914_170608_init.up,
    down: migration_20260914_170608_init.down,
    name: '20260914_170608_init',
  },
  {
    up: migration_20260930_135138_add_start_guide_about_blocks.up,
    down: migration_20260930_135138_add_start_guide_about_blocks.down,
    name: '20260930_135138_add_start_guide_about_blocks',
  },
  {
    up: migration_20260930_155604_hero_arch_images.up,
    down: migration_20260930_155604_hero_arch_images.down,
    name: '20260930_155604_hero_arch_images',
  },
  {
    up: migration_20260930_161600_structure_contact_course_fields.up,
    down: migration_20260930_161600_structure_contact_course_fields.down,
    name: '20260930_161600_structure_contact_course_fields',
  },
  {
    up: migration_20261001_133425_spotplayer_license.up,
    down: migration_20261001_133425_spotplayer_license.down,
    name: '20261001_133425_spotplayer_license'
  },
];

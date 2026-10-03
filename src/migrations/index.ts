import * as migration_20260914_170608_init from './20260914_170608_init';
import * as migration_20260930_135138_add_start_guide_about_blocks from './20260930_135138_add_start_guide_about_blocks';
import * as migration_20260930_155604_hero_arch_images from './20260930_155604_hero_arch_images';
import * as migration_20260930_161600_structure_contact_course_fields from './20260930_161600_structure_contact_course_fields';
import * as migration_20261001_133425_spotplayer_license from './20261001_133425_spotplayer_license';
import * as migration_20261001_141724_brand_logo_on_dark from './20261001_141724_brand_logo_on_dark';
import * as migration_20261003_040235_stats_strip_block from './20261003_040235_stats_strip_block';
import * as migration_20261003_064007_students_last_login_mobile_local from './20261003_064007_students_last_login_mobile_local';
import * as migration_20261003_074756_spotplayer_device from './20261003_074756_spotplayer_device';
import * as migration_20261003_111422_students_first_last_name from './20261003_111422_students_first_last_name';
import * as migration_20261003_112841_students_province from './20261003_112841_students_province';
import * as migration_20261003_113222_consultation_province from './20261003_113222_consultation_province';
import * as migration_20261003_154036_site_settings_seo_local from './20261003_154036_site_settings_seo_local';

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
    name: '20261001_133425_spotplayer_license',
  },
  {
    up: migration_20261001_141724_brand_logo_on_dark.up,
    down: migration_20261001_141724_brand_logo_on_dark.down,
    name: '20261001_141724_brand_logo_on_dark',
  },
  {
    up: migration_20261003_040235_stats_strip_block.up,
    down: migration_20261003_040235_stats_strip_block.down,
    name: '20261003_040235_stats_strip_block',
  },
  {
    up: migration_20261003_064007_students_last_login_mobile_local.up,
    down: migration_20261003_064007_students_last_login_mobile_local.down,
    name: '20261003_064007_students_last_login_mobile_local',
  },
  {
    up: migration_20261003_074756_spotplayer_device.up,
    down: migration_20261003_074756_spotplayer_device.down,
    name: '20261003_074756_spotplayer_device',
  },
  {
    up: migration_20261003_111422_students_first_last_name.up,
    down: migration_20261003_111422_students_first_last_name.down,
    name: '20261003_111422_students_first_last_name',
  },
  {
    up: migration_20261003_112841_students_province.up,
    down: migration_20261003_112841_students_province.down,
    name: '20261003_112841_students_province',
  },
  {
    up: migration_20261003_113222_consultation_province.up,
    down: migration_20261003_113222_consultation_province.down,
    name: '20261003_113222_consultation_province',
  },
  {
    up: migration_20261003_154036_site_settings_seo_local.up,
    down: migration_20261003_154036_site_settings_seo_local.down,
    name: '20261003_154036_site_settings_seo_local'
  },
];

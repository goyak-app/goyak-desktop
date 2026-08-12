import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { ask } from '@tauri-apps/plugin-dialog';

export async function checkForUpdates(silent = false): Promise<void> {
  try {
    const update = await check();

    if (!update) {
      if (!silent) {
        await ask('You are on the latest version!', {
          title: 'Goyak Update',
          kind: 'info',
          okLabel: 'OK',
          cancelLabel: '',
        });
      }
      return;
    }

    const shouldUpdate = await ask(
      `A new version (${update.version}) is available.\n\n${update.body || 'Bug fixes and improvements.'}\n\nWould you like to update now?`,
      {
        title: 'Goyak Update Available',
        kind: 'info',
        okLabel: 'Update',
        cancelLabel: 'Later',
      }
    );

    if (!shouldUpdate) return;

    await update.downloadAndInstall();
    await relaunch();
  } catch (error) {
    if (!silent) {
      console.error('Update check failed:', error);
    }
  }
}

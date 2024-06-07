import { join, dirname } from 'path';
import { PreferencesIconType } from './types';
import Store from 'electron-store';
import type { AddonMainContext } from '@getflywheel/local/main';
import { BrowserWindow, Tray } from 'electron';

Store.initRenderer();

let window: BrowserWindow;
let willQuitApp: boolean = false;
let tray: Tray;

const store = new Store();

// noinspection JSUnusedGlobalSymbols
export default function (context: AddonMainContext): void {
	const { electron } = context;
	const { app, nativeImage, Tray, Menu, ipcMain } = electron;
	const gotTheLock = app.requestSingleInstanceLock();

	if (!gotTheLock) {
		app.exit();

		return;
	}

	app.on('browser-window-created', (_event, browserWindow) => {
		if (!window) {
			window = browserWindow;

			window.on('close', (event) => {
				if (willQuitApp) {
					return;
				}

				event.preventDefault();
				window.hide();
			});
		}
	});

	app.on('ready', () => {
		const iconType = store.get('iconType') as PreferencesIconType || PreferencesIconType.COLORED;

		tray = new Tray(nativeImage.createFromPath(join(dirname(__dirname), `assets/icon-${iconType}.png`)));

		tray.setContextMenu(Menu.buildFromTemplate([
			{
				label: 'Open',
				click: function () {
					window.show();
				},
			},
			{
				label: 'Reload',
				click: function () {
					willQuitApp = true;
					app.relaunch();
					app.quit();
				},
			},
			{
				label: 'Quit',
				click: function () {
					willQuitApp = true;
					app.quit();
				},
			},
		]));

		tray.on('click', () => {
			if (window.isVisible()) {
				window.hide();
			} else {
				window.show();
			}
		});

		tray.setIgnoreDoubleClickEvents(true);
	});

	app.on('second-instance', () => {
		if (window) {
			window.show();
		}
	});

	ipcMain.handle('sumottoLocalAddonTray:changeIconType', (_event, newIconType) => {
		tray.setImage(nativeImage.createFromPath(join(dirname(__dirname), `assets/icon-${newIconType}.png`)));
	});

	ipcMain.on('addonInstallerService:relaunch', () => {
		willQuitApp = true;
		app.quit();
	});
}

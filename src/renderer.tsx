import { FlySelect } from '@getflywheel/local-components';
import { PreferencesIconType } from './types';
import Store from 'electron-store';
import React from 'react';
import type { AddonRendererContext, AddonSettingsItem } from '@getflywheel/local/renderer';

const store = new Store();

// noinspection JSUnusedGlobalSymbols
export default function (context: AddonRendererContext) {
	const { hooks, electron } = context;
	const { ipcRenderer } = electron;

	function ColorIconSelect () {
		const iconType = store.get('iconType') as PreferencesIconType || PreferencesIconType.COLORED;

		return <FlySelect
			value={iconType}
			options={[
				PreferencesIconType.COLORED,
				PreferencesIconType.MONOCHROME,
			]}
			onChange={(newIconType) => {
				store.set('iconType', newIconType);

				ipcRenderer.invoke('sumottoLocalAddonTray:changeIconType', newIconType).then();
			}}
		/>;
	}

	const preferenceItem: AddonSettingsItem = {
		path: 'sumottoLocalAddonTray:preferences',
		displayName: 'Tray',
		sections: [
			{
				rows: [
					{
						name: 'Icon Type',
						component: ColorIconSelect,
					},
				],
			},
		],
		onApply: () => {
		},
	};

	hooks.addFilter('preferencesMenuItems', (menu: AddonSettingsItem[]) => {
		menu.push(preferenceItem);

		return menu;
	});
}

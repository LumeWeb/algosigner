import { FunctionalComponent } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import { JsonRpcMethod } from '@algosigner/common/messaging/types';

import HeaderComponent from './HeaderComponent';
import DeleteWallet from 'components/DeleteWallet';
import Logo from './Logo';
import { sendMessage } from 'services/Messaging';
import LedgerNetworksConfiguration from './LedgerNetworksConfiguration';

const SettingsMenu: FunctionalComponent = () => {
  const [active, setActive] = useState<boolean>(false);
  const [currentMenu, setCurrentMenu] = useState<string>('settings');

  let menuClass: string = 'menu';
  if (active) menuClass += ' is-active';

  const flip = () => {
    setActive(!active);
  };

  const logout = () => {
    sendMessage(JsonRpcMethod.Logout, {}, function () {
      route('/login');
    });
  };

  const getSubmenu = () => {
    switch (currentMenu) {
      case 'networkConfiguration':
        return html`<${LedgerNetworksConfiguration}
          closeFunction=${() => {
            setCurrentMenu('settings');
            flip();
          }}
        />`;
      case 'delete':
        return html`<${DeleteWallet} />`;
      default:
        return '';
    }
  };

  return html`
    <div class="has-text-centered" style="cursor: pointer; min-width: 24px;" onClick=${flip}>
      <span class="icon">
        <i class="fas fa-cog" aria-hidden="true" />
      </span>
    </div>

    <div class="${menuClass}">
      <${HeaderComponent}>
        <${Logo} style="flex: 1 1 100%; display: flex;" />
        <span class="pr-4">Settings</span>
        <div class="has-text-centered" style="cursor: pointer; min-width: 24px;" onClick=${flip}>
          <span class="icon">
            <i class="fas fa-times" aria-hidden="true" />
          </span>
        </div>
      </${HeaderComponent}>
      <div style="background: white;">
        ${
          currentMenu === 'settings' &&
          html`
            <a
              class="menu-item"
              id="showNetworkConfiguration"
              onClick=${() => setCurrentMenu('networkConfiguration')}
            >
              Network Configuration
            </a>
            <a class="menu-item" id="showWalletDetails" onClick=${() => setCurrentMenu('delete')}
              >Delete wallet</a
            >
            <a class="menu-item" onClick=${logout}>Log out</a>
          `
        }
        ${
          currentMenu !== 'settings' &&
          html`
            <div
              class="has-text-centered"
              style="cursor: pointer; min-width: 24px; position: absolute; top: 3.5em; left: 1em;"
              onClick=${() => setCurrentMenu('settings')}
            >
              <span class="icon">
                <i class="fas fa-arrow-left" aria-hidden="true" />
              </span>
            </div>
            ${getSubmenu()}
          `
        }
      </div>
      <div class="modal-background" style="z-index: -1;" onClick=${flip} />
    </div>
  `;
};

export default SettingsMenu;

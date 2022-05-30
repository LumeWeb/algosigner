import { PLATFORM } from '../utils/environment';
import { OnMessageHandler } from './handler';
import { extensionBrowser } from '@algosigner/common/chrome';

export class MessageApi {
  public static listen() {
    switch (PLATFORM) {
        case 'chrome':
            extensionBrowser.runtime.onMessage.addListener(async (request, sender) => {
                let sendResponse;
                const promise = new Promise((resolve) => {
                    sendResponse = resolve;
                })
                OnMessageHandler.handle(request, sender, sendResponse);
                return promise;
            });
        break;
    }
  }

  public static send(d: any) {
    if ('error' in d) {
      // A side-effect of the chrome messaging turns undefined into a string
      // So we clean the data field on error responses
      if (d.error.data === 'undefined') delete d.error.data;
    }
    var tab_id = d.originTabID || 0;
      extensionBrowser.tabs.sendMessage(tab_id, d);
  }
}

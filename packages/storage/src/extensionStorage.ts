/**
 * @license
 * Copyright 2020
 * =========================================
 */

import { extensionBrowser } from '@algosigner/common/chrome';
import { logging } from '@algosigner/common/logging';

///
// Handles the setting and retrieval of data into the browser storage.local location.
///
export class ExtensionStorage {
  ///
  // Takes an objectName and saveObject and sets or overrides a
  // storage.local instance of this combo.
  // Callback: Callback will return a boolean of true if storage sets without error
  // or false otherwise.
  ///
  public async setStorage(objectName: string, saveObject: Object, callback: Function): Promise<void> {
      await extensionBrowser.storage.local.set({[objectName]: saveObject});
      const isSuccessful = !extensionBrowser.runtime.lastError;
      if (!isSuccessful) {
          logging.log(
              extensionBrowser.runtime.lastError &&
              `Chrome error: ${extensionBrowser.runtime.lastError.message}`
          );
      }

      callback && callback(isSuccessful);
  }

  ///
  // Uses the provided objectName and returns any associated storage.local item.
  // Callback: Callback will return a boolean of true if an account exists
  // or false if no account is present.
  ///
    public async getStorage(objectName: string, callback: Function) {
        const result = await extensionBrowser.storage.local.get([objectName]);
        callback && callback(result[objectName]);
    }

  ///
  // Check for the existance of a wallet account.
  // Callback: Callback will return a boolean of true if an account exists
  // or false if no account is present.
  ///
    public noAccountExistsCheck(objectName: string, callback: Function) {
        const result = extensionBrowser.storage.local.get([objectName]);
        if (result[objectName]) {
            callback && callback(true);
        } else {
            callback && callback(false);
        }
    }

  ///
  // Clear storage.local extension data.
  // Callback: Callback will return true if successful, false if there is an error.
  ///
  public async clearStorageLocal(callback: Function) {
      await extensionBrowser.storage.local.clear();
      if (!extensionBrowser.runtime.lastError) {
          callback && callback(true);
      } else {
          callback && callback(false);
      }
  }

  ///
  // **Testing Method**
  // View raw storage.local extension data.
  // Callback: Callback will return all data stored for the extension.
  ///
    protected async getStorageLocal(callback: Function) {
        const result = await extensionBrowser.storage.local.get(null);
        if (!extensionBrowser.runtime.lastError) {
            callback(JSON.stringify(result));
        }
    }
}
const extensionStorage = new ExtensionStorage();
export default extensionStorage;

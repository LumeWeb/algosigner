import { ExtensionStorage } from '@algosigner/storage/src/extensionStorage';
import { Ledger } from '@algosigner/common/types';
import { InternalMethods } from '../messaging/internalMethods';
import { Cache } from '../messaging/types';
import { initializeCache } from './helper';

const TIMEOUT = 500;

///
// Helper class for getting and saving the details of assets in an ordered fashion
///
export default class AssetsDetailsHelper {
  private static assetsToAdd: { [key: string]: Array<number> } = {
    [Ledger.TestNet]: [],
    [Ledger.MainNet]: [],
  };

  private static timeouts = {
    [Ledger.TestNet]: null,
    [Ledger.MainNet]: null,
  };

  public static add(assets: Array<number>, ledger: Ledger) {
    // If this ledger doesn't have assets yet, then default them to an array
    if (this.assetsToAdd[ledger] === undefined) {
      this.assetsToAdd[ledger] = [];
    }

    this.assetsToAdd[ledger] = this.assetsToAdd[ledger].concat(assets);
    if (this.timeouts[ledger] === null && this.assetsToAdd[ledger].length > 0)
      this.timeouts[ledger] = setTimeout(() => this.run(ledger), TIMEOUT);
  }

  private static run(ledger: Ledger) {
    if (this.assetsToAdd[ledger].length === 0) {
      this.timeouts[ledger] = null;
      return;
    }

    const extensionStorage = new ExtensionStorage();
    extensionStorage.getStorage('cache', (storedCache: any) => {
      const cache: Cache = initializeCache(storedCache, ledger);

      let assetId = this.assetsToAdd[ledger][0];
      while (assetId in cache.assets[ledger]) {
        this.assetsToAdd[ledger].shift();
        if (this.assetsToAdd[ledger].length === 0) {
          this.timeouts[ledger] = null;
          return;
        }
        assetId = this.assetsToAdd[ledger][0];
      }

      const indexer = InternalMethods.getIndexer(ledger);
      indexer
        .lookupAssetByID(assetId)
        .do()
        .then((res: any) => {
          cache.assets[ledger][assetId] = res.asset.params;
          extensionStorage.setStorage('cache', cache, null);
        })
        .catch(() => {
          // If there's an issue with the request, remove the asset from the queue.
          // If not done, it will just keep trying to get the same asset over and over.
          this.assetsToAdd[ledger].shift();
        })
        .finally(() => {
          this.timeouts[ledger] = setTimeout(() => this.run(ledger), TIMEOUT);
        });
    });
  }
}

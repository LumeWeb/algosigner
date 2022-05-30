import { getBaseSupportedLedgers } from './types/ledgers';
import {extensionBrowser} from "./chrome";
import {Runtime} from "webextension-polyfill";

export function isFromExtension(sender: Runtime.MessageSender): boolean {
  // @ts-ignore
  const s = (sender?.origin || sender?.url).split('://');
  return ['chrome-extension','moz-extension'].includes(s[0]) && sender?.id === extensionBrowser.runtime.id;
}

/**
 * removeEmpty gets a dictionary and removes empty values
 * @param obj
 * @returns {*}
 */
export function removeEmptyFields(obj: { [index: string]: any }): any {
  Object.keys(obj).forEach((key: string) => {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === null || obj[key] === undefined || obj[key].length === 0) delete obj[key];
    }
  });
  return obj;
}

/**
 * Check if a ledger belongs to our base supported ledgers (e.g: links to GoalSeeker)
 * @param ledger
 * @returns boolean
 */
export function isLedgerBaseSupported(ledger: string): boolean {
  return getBaseSupportedLedgers().map((l) => l.name.toLowerCase()).includes(ledger.toLowerCase());
}

/**
 * Converts full addresses into a shorter format:
 * AAAAAAAAAA.....AAAAAAAAAA
 * @param address
 * @returns string
 */
export function obfuscateAddress(address: string): string {
  return `${address.slice(0, 10)}.....${address.slice(-10)}`;
}

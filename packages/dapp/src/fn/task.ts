import { ITask } from './interfaces';

import { MessageBuilder } from '../messaging/builder';

import {
  Transaction,
  RequestErrors,
  MultisigTransaction,
  WalletTransaction,
} from '@algosigner/common/types';
import { JsonRpcMethod, JsonPayload } from '@algosigner/common/messaging/types';
import { Runtime } from '@algosigner/common/runtime/runtime';

export class Task extends Runtime implements ITask {
  static subscriptions: { [key: string]: Function } = {};

  connect(): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.Authorization, {});
  }

  accounts(params: JsonPayload, error: RequestErrors = RequestErrors.None): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.Accounts, params as JsonPayload, error);
  }

  sign(params: Transaction, error: RequestErrors = RequestErrors.None): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.SignTransaction, params, error);
  }

  signMultisig(
    params: MultisigTransaction,
    error: RequestErrors = RequestErrors.None
  ): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.SignMultisigTransaction, params, error);
  }

  send(params: Transaction, error: RequestErrors = RequestErrors.None): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.SendTransaction, params, error);
  }

  algod(params: JsonPayload, error: RequestErrors = RequestErrors.None): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.Algod, params, error);
  }

  indexer(params: JsonPayload, error: RequestErrors = RequestErrors.None): Promise<JsonPayload> {
    return MessageBuilder.promise(JsonRpcMethod.Indexer, params, error);
  }

  subscribe(eventName: string, callback: Function) {
    Task.subscriptions[eventName] = callback;
  }

  /**
   * @param transactionsOrGroups array or nested array of grouped transaction objects
   * @returns array or nested array of signed transactions
   */
  signTxn(
    transactionsOrGroups: Array<WalletTransaction>,
    error: RequestErrors = RequestErrors.None
  ): Promise<JsonPayload> {
    const formatError = new Error(RequestErrors.InvalidFormat);
    // We check for empty arrays
    if (!Array.isArray(transactionsOrGroups) || !transactionsOrGroups.length) throw formatError;
    transactionsOrGroups.forEach((txOrGroup) => {
      // We check for no null values and no empty nested arrays
      if (
        txOrGroup === null ||
        txOrGroup === undefined ||
        (!Array.isArray(txOrGroup) && typeof txOrGroup === 'object' &&
          (!txOrGroup.txn || (txOrGroup.txn && !txOrGroup.txn.length))
        ) ||
        (Array.isArray(txOrGroup) && 
          (!txOrGroup.length || (txOrGroup.length && !txOrGroup.every((tx) => tx !== null)))
        )
      )
        throw formatError;
    });

    const params = {
      transactions: transactionsOrGroups,
    };
    return MessageBuilder.promise(JsonRpcMethod.HandleWalletTransactions, params, error);
  }
}

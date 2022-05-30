import { JsonRpcMethod } from '@algosigner/common/messaging/types';
import {extensionBrowser} from "@algosigner/common/chrome";

export async function sendMessage(method: JsonRpcMethod, params: any, callback: any): Promise<void> {
   const response = await extensionBrowser.runtime.sendMessage({
        source:'ui',
        body: {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: (+new Date).toString(16)
        }
    });
   callback(response);
}

import dotenv from "dotenv";
dotenv.config();

import {
  ActionTraceData,
  createDfuseClient,
  InboundMessage,
  InboundMessageType,
} from "@dfuse/client";
import nodeFetch from "cross-fetch";
import { processSale } from "./lib/discord";
import { runMain } from "./lib/run";
import { PurchaseSaleProps } from "./typings/sale";

(global as any).WebSocket = require("ws");

// MAIN function
async function main(): Promise<void> {
  const client = createDfuseClient({
    authentication: false,
    network: "wax.dfuse.eosnation.io",
    httpClientOptions: {
      fetch: nodeFetch,
    },
  });

  console.log("Starting...");

  const stream = await client.streamActionTraces(
    { accounts: "atomicmarket", action_names: "purchasesale" },
    (message: InboundMessage<any>) => {
      if (message.type === InboundMessageType.ACTION_TRACE) {
        const { sale_id, buyer }: PurchaseSaleProps = (
          message.data as ActionTraceData<any>
        ).trace.act.data;

        console.log(`Sale: #${sale_id} | Buyer: '${buyer}'`);

        // NOTE: do not await as it will block the process
        processSale(sale_id, buyer);
      }
    }
  );

  await new Promise(() => {});
  await stream.close();

  client.release();
}

runMain(main);

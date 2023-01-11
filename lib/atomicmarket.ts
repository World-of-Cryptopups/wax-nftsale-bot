import { AtomicMarketApi } from "atomicmarket";
import fetch from "cross-fetch";

export const atomicmarket = new AtomicMarketApi(
  "https://atomic.wax.eosrio.io",
  "atomicmarket",
  { fetch }
);

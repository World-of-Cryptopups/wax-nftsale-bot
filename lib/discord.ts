// discord webhook sender

import {
  IMarketAsset,
  IMarketPrice,
  ISale,
} from "atomicmarket/build/API/Explorer/Objects";
import fetch from "cross-fetch";
import { atomicmarket } from "./atomicmarket";
import { ATOMICHUB_COLLECTION } from "./config";
import { WEBHOOK } from "./env";
import { sleep } from "./etc";

export const processSale = async (saleId: number, buyer: string) => {
  // try to prevent sudden multiple requests
  // TODO: add ways to improve or change this
  await sleep(1000);

  let sale: ISale;
  try {
    sale = await atomicmarket.getSale(saleId.toString());
  } catch (e) {
    console.error(`Failed to process Sale: #${saleId} | Error: ${String(e)}`);
    return;
  }

  for (const i of sale.assets) {
    // ignore other sales other than the own collection defined
    if (i.collection.collection_name !== ATOMICHUB_COLLECTION) {
      return;
    }

    // send the sale embed to the discord webhook
    const res = createResponse(i, buyer, sale.seller, sale.price, saleId);

    let discordWebhook = WEBHOOK;
    if (!WEBHOOK.endsWith("?wait=true")) {
      discordWebhook += "?wait=true";
    }
    const r = await fetch(discordWebhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(res),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error(data);
      continue; // just try to continue if failed to send
    }

    console.log(`Sent: SALE #${saleId}`);
  }
};

const handleImg = (img: string) => {
  if (img.startsWith("https://") || img.startsWith("http://")) {
    return img;
  }

  return `https://atomichub-ipfs.com/ipfs/${img}`;
};

// generate embed response
const createResponse = (
  asset: IMarketAsset,
  buyer: string,
  seller: string,
  price: IMarketPrice,
  saleId: number
) => {
  return {
    content: null,
    embeds: [
      {
        author: {
          name: asset.collection.collection_name,
          icon_url: `https://atomichub-ipfs.com/ipfs/${asset.collection.img}`,
        },
        thumbnail: asset.template.immutable_data.img
          ? {
              url: handleImg(asset.template.immutable_data.img),
            }
          : undefined,
        title: asset.name,
        fields: [
          {
            name: "Buyer",
            value: buyer,
            inline: true,
          },
          {
            name: "Seller",
            value: seller,
            inline: true,
          },
          {
            name: "\u200b",
            value: "\u200b",
          },
          {
            name: "Price",
            value: `${(Number(price.amount) / 100000000).toFixed(2)} ${
              price.token_symbol
            }`,
          },
        ],
        image: asset.template.immutable_data.img
          ? {
              url: handleImg(asset.template.immutable_data.img),
            }
          : undefined,
        timestamp: new Date().toISOString(),
        footer: {
          text: `Sale ID: ${saleId}`,
        },
      },
    ],
  };
};

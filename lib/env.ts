const WEBHOOK = process.env.WEBHOOK || "";

if (WEBHOOK === "") {
  throw new Error(
    "Need to defined discord webhook with the WEBHOOK environment variable."
  );
}

export { WEBHOOK };

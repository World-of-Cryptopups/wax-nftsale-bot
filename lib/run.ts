export function runMain(runner: () => Promise<void>): void {
  /**
   * Helper to display `unhandledRejection` rejection errors.
   */
  process.on("unhandledRejection", (error) => {
    const messages = [
      "An unhandled rejection error has been catched at the process level. This is",
      "completely wrong and should never happen in the examples. If you see this behavior,",
      "there is probably something very fishy.",
      "",
      "You should log a bug report if you see this error, attach the debug output by",
      "using `DEBUG='dfuse:*' yarn run:example ...`.",
      "",
      "Read about unhandle rejection error https://stackoverflow.com/q/40500490/697930",
      "",
    ];

    console.error(messages.join("\n"));
    console.error(error);

    throw error;
  });

  runner()
    // eslint-disable-next-line promise/always-return
    .then(() => {
      console.log("Done streaming.");
      process.exit(0);
    })
    .catch((error) => {
      console.log("An untrapped error occurred.", error);
      process.exit(1);
    });
}

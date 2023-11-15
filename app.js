const TG = require("telegram-bot-api");
require("dotenv").config();
const { SigningStargateClient, StargateClient } = require("@cosmjs/stargate");
const { readFile } = require("fs/promises");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz";

const api = new TG({ token: process.env.BOT_TOKEN });
const messageProvider = new TG.GetUpdateMessageProvider();

async function getAliceSignerFromMnemonic() {
  return DirectSecp256k1HdWallet.fromMnemonic(
    (await readFile("./testnet.alice.mnemonic.key")).toString(),
    {
      prefix: "cosmos",
    }
  );
}

async function monitorBalance() {
  const client = await StargateClient.connect(rpc);
  console.log("With client, chain id:", await client.getChainId());
  console.log("Height:", await client.getHeight());

  const aliceSigner = await getAliceSignerFromMnemonic();
  const alice = (await aliceSigner.getAccounts())[0].address;
  console.log("Alice's address from signer", alice);

  let response = await client.getAllBalances(alice);

  console.log("Alice's Balances:", response);
  console.log("Balance Amount:", response[0].amount);

  if (response[0].amount >= 5000000) {
    sendMessageTelegram("Conditon Met");
    console.log("\n\t\t\t*Conditon Met*");
  } else {
    sendMessageTelegram("Conditon Not Met");
    console.log("\n\t\t\t*Conditon Not Met*");
  }

  console.log(
    "\n--------------------------------------------------------------------------\n"
  );
}

async function sendMessageTelegram(msg) {
  api.setMessageProvider(messageProvider);
  api
    .start()
    .then(() => {
      console.log("API is started");
    })
    .catch(console.err);

  api.sendMessage({
    chat_id: "@top_coins_price_alerts",
    text: "*" + msg + "*",
    parse_mode: "Markdown",
  });

  api
    .stop()
    .then(() => {
      console.log("API is stopped");
    })
    .catch(console.err);
}

setInterval(monitorBalance, 10 * 1000);

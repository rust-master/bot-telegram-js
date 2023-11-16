const TG = require("telegram-bot-api");
require("dotenv").config();
const { SigningStargateClient, StargateClient } = require("@cosmjs/stargate");
const { readFile } = require("fs/promises");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");

const rpc = "https://rpc.sentry-02.theta-testnet.polypore.xyz";

const api = new TG({ token: process.env.BOT_TOKEN });
const messageProvider = new TG.GetUpdateMessageProvider();

async function getAccount1SignerFromMnemonic() {
  return DirectSecp256k1HdWallet.fromMnemonic(
    (await readFile("./testnet.account1.mnemonic.key")).toString(),
    {
      prefix: "cosmos",
    }
  );
}

async function monitorBalance() {
  console.log("run");
  const client = await StargateClient.connect(rpc);
  console.log("With client, chain id:", await client.getChainId());
  console.log("Height:", await client.getHeight());

  const account1Signer = await getAccount1SignerFromMnemonic();
  const account1 = (await account1Signer.getAccounts())[0].address;
  console.log("Account1's address from signer", account1);

  let response = await client.getAllBalances(account1);

  console.log("Account1's Balances:", response);
  console.log("Balance Amount:", response[0].amount);

  if (response[0].amount >= 5000000) {
    sendMessageTelegram("Conditon Met");
    console.log("\n\t\t\t*Conditon Met*");

    sendTokens(account1Signer, account1, 4999500);
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

async function sendTokens(signer, from, amount) {
  const to = "cosmos1pgns8f055aqrsk0f6hwp6x9ffffwtq25r0kmkr";
  const signingClient = await SigningStargateClient.connectWithSigner(
    rpc,
    signer
  );

  const result = await signingClient.sendTokens(
    from,
    to,
    [{ denom: "uatom", amount: amount }],
    {
      amount: [{ denom: "uatom", amount: "500" }],
      gas: "200000",
    }
  );

  console.log("Transfer result:", result);
  sendMessageTelegram("Transaction Hash: " + result.transactionHash);
}

setInterval(monitorBalance, 30 * 1000);

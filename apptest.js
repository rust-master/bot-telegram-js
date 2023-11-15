const TG = require("telegram-bot-api");
require("dotenv").config();
const {
  SigningStargateClient,
  StargateClient,
} = require("@cosmjs/stargate");
const { readFile } = require("fs/promises");
const {
  DirectSecp256k1HdWallet,
} = require("@cosmjs/proto-signing");

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz";

async function getAliceSignerFromMnemonic() {
  return DirectSecp256k1HdWallet.fromMnemonic(
    (await readFile("./testnet.alice.mnemonic.key")).toString(),
    {
      prefix: "cosmos",
    }
  );
}

async function getAccount2SignerFromMnemonic() {
  return DirectSecp256k1HdWallet.fromMnemonic(
    (await readFile("./testnet.account2.mnemonic.key")).toString(),
    {
      prefix: "cosmos",
    }
  );
}

const api = new TG({
  token: process.env.BOT_TOKEN,
});

const messageProvider = new TG.GetUpdateMessageProvider();

function main() {
  // Set message provider and start API
  api.setMessageProvider(messageProvider);
  api
    .start()
    .then(() => {
      console.log("API is started");
    })
    .catch(console.err);

  api.sendMessage({
    chat_id: "@top_coins_price_alerts",
    text: "Welcome to the *" + "Telegram Bot" + "*",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Visit us!",
            url: "https://github.com/mast/telegram-bot-api",
          },
        ],
      ],
    },
  });
}

async function generateKey() {
  const wallet = await DirectSecp256k1HdWallet.generate(24);
  process.stdout.write(wallet.mnemonic);
  const accounts = await wallet.getAccounts();
  console.log("\nMnemonic with 1st account:", accounts[0].address);

  // cosmos1wfjynp59casleh75dclthuueaunw778g4f82my
  // margin curious divorce slab cruel waste faculty come fit borrow busy solution cake major husband strategy arrive tape increase power cabbage sample bird library
}

// cosmos1pgns8f055aqrsk0f6hwp6x9ffffwtq25r0kmkr
// pond infant ribbon hen brain invest taxi vendor just cover recipe federal rail boss scrap confirm improve stomach junk sphere word during walk final

async function web3Cosmos() {
  generateKey();

  const client = await StargateClient.connect(rpc);
  console.log(
    "With client, chain id:",
    await client.getChainId(),
    ", height:",
    await client.getHeight()
  );

  console.log(
    "Balances:",
    await client.getAllBalances("cosmos1wfjynp59casleh75dclthuueaunw778g4f82my")
  );

  const aliceSigner = await getAliceSignerFromMnemonic();
  const alice = (await aliceSigner.getAccounts())[0].address;
  console.log("Alice's address from signer", alice);

  const account2Signer = await getAccount2SignerFromMnemonic();
  const account2 = (await account2Signer.getAccounts())[0].address;
  console.log("account2Signer's address from signer", account2);

  const signingClient = await SigningStargateClient.connectWithSigner(
    rpc,
    account2Signer
  );

  console.log(
    "With signing client, chain id:",
    await signingClient.getChainId(),
    ", height:",
    await signingClient.getHeight()
  );

  console.log("Alice balance before:", await client.getAllBalances(alice));
  console.log(
    "Account2 balance before:",
    await client.getAllBalances(account2)
  );
  // Execute the sendTokens Tx and store the result
  const result = await signingClient.sendTokens(
    account2,
    alice,
    [{ denom: "uatom", amount: "3000" }],
    {
      amount: [{ denom: "uatom", amount: "500" }],
      gas: "200000",
    }
  );
  // Output the result of the Tx
  console.log("Transfer result:", result);
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

setInterval(monitorBalance, 10 * 1000);

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

// web3Cosmos();

// main();

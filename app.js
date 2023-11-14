const TG = require("telegram-bot-api");
require("dotenv").config();
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { StargateClient } =  require("@cosmjs/stargate");

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz"



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
    const wallet = await DirectSecp256k1HdWallet.generate(24)
    process.stdout.write(wallet.mnemonic)
    const accounts = await wallet.getAccounts()
    console.log("\nMnemonic with 1st account:", accounts[0].address)

    // cosmos1wfjynp59casleh75dclthuueaunw778g4f82my
    // margin curious divorce slab cruel waste faculty come fit borrow busy solution cake major husband strategy arrive tape increase power cabbage sample bird library
}




async function web3Cosmos() {
    generateKey()

    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())

    console.log(
        "Balances:",
        await client.getAllBalances("cosmos1wfjynp59casleh75dclthuueaunw778g4f82my")
    )

}

web3Cosmos()

// main();

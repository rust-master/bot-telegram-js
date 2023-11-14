const TG = require("telegram-bot-api");
require("dotenv").config();

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

main();

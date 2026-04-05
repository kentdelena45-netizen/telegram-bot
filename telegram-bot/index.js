const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;

if (!token) {
    console.error("❌ TOKEN is missing!");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const OWNER_ID = 8420104044;

let shopStatus = 'closed';
let userState = {};

// START
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to ZEIJIE SHOP!", {
        reply_markup: {
            keyboard: [
                ["🛒 Buy Account"],
                ["📊 Check Status"]
            ],
            resize_keyboard: true
        }
    });
});

// OPEN
bot.onText(/\/open/, (msg) => {
    if (msg.from.id !== OWNER_ID) return;
    shopStatus = 'open';
    bot.sendMessage(msg.chat.id, "🟢 Shop is now OPEN!");
});

// CLOSE
bot.onText(/\/close/, (msg) => {
    if (msg.from.id !== OWNER_ID) return;
    shopStatus = 'closed';
    bot.sendMessage(msg.chat.id, "🔴 Shop is now CLOSED!");
});

// MAIN HANDLER
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    if (text === "📊 Check Status") {
        return bot.sendMessage(chatId,
            shopStatus === 'open' ? "🟢 Shop is OPEN!" : "🔴 Shop is CLOSED!"
        );
    }

    if (text === "🛒 Buy Account") {
        if (shopStatus === 'closed') {
            return bot.sendMessage(chatId, "🔴 Shop is CLOSED.");
        }
        userState[chatId] = { step: 'game' };
        return bot.sendMessage(chatId, "What game/account do you want?");
    }

    if (userState[chatId]) {
        let state = userState[chatId];

        if (state.step === 'game') {
            state.game = text;
            state.step = 'details';
            return bot.sendMessage(chatId, "Enter details:");
        }

        if (state.step === 'details') {
            state.details = text;

            bot.sendMessage(OWNER_ID,
                `🛒 NEW ORDER\nUser: @${msg.from.username || "No username"}\nGame: ${state.game}\nDetails: ${state.details}`
            );

            bot.sendMessage(chatId, "✅ Order sent!");
            delete userState[chatId];
        }
    }
});

console.log("✅ Bot is running...");

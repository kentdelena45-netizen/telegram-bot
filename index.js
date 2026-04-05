const TelegramBot = require('node-telegram-bot-api');

// 🔑 PUT YOUR TOKEN
const token = '8458043093:AAHWcxPht0sSONOjTKz3MHktajulgl4AVuU';

const bot = new TelegramBot(token, { polling: true });

// 🔒 YOUR TELEGRAM ID
const OWNER_ID = 8420104044;

// 🟢 / 🔴 Shop Status
let shopStatus = 'closed';

// temp user order storage
let userState = {};

// START MENU
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

// OPEN SHOP
bot.onText(/\/open/, (msg) => {
    if (msg.from.id !== OWNER_ID) return;
    shopStatus = 'open';
    bot.sendMessage(msg.chat.id, "🟢 Shop is now OPEN!");
});

// CLOSE SHOP
bot.onText(/\/close/, (msg) => {
    if (msg.from.id !== OWNER_ID) return;
    shopStatus = 'closed';
    bot.sendMessage(msg.chat.id, "🔴 Shop is now CLOSED!");
});

// CHECK STATUS BUTTON
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // ignore commands
    if (text.startsWith('/')) return;

    // STATUS BUTTON
    if (text === "📊 Check Status") {
        if (shopStatus === 'open') {
            return bot.sendMessage(chatId, "🟢 Shop is OPEN!");
        } else {
            return bot.sendMessage(chatId, "🔴 Shop is CLOSED!");
        }
    }

    // BUY BUTTON
    if (text === "🛒 Buy Account") {
        if (shopStatus === 'closed') {
            return bot.sendMessage(chatId, "🔴 Shop is CLOSED. Try later.");
        }

        userState[chatId] = { step: 'game' };

        return bot.sendMessage(chatId, "What game/account do you want?");
    }

    // ORDER FLOW
    if (userState[chatId]) {
        let state = userState[chatId];

        if (state.step === 'game') {
            state.game = text;
            state.step = 'details';
            return bot.sendMessage(chatId, "Enter details (rank, budget, etc):");
        }

        if (state.step === 'details') {
            state.details = text;

            // SEND TO OWNER
            bot.sendMessage(OWNER_ID,
                `🛒 NEW ORDER\n\nUser: @${msg.from.username || "No username"}\nGame: ${state.game}\nDetails: ${state.details}`
            );

            bot.sendMessage(chatId, "✅ Order sent! Wait for admin reply.");

            delete userState[chatId];
        }
    }
});
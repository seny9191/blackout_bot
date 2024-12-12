import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getBlackouts } from './data.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("text", async (ctx) => {
    const dates = await getBlackouts();
    ctx.reply(dates)
})

process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
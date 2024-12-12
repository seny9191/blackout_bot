import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getBlackouts } from './data.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("text", async (ctx) => {
    console.log("Text input")
    try {
        const dates = await getBlackouts(3);
        ctx.reply(dates)
    } catch (error) {
        console.log("Error occured ", error.message)
    }
})

bot.launch()

process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
require(`dotenv`).config();

const { Telegraf } = require(`telegraf`);
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch(console.log);

bot.command([`start`, `help`], ctx => {
    if (ctx.chat.type !== `private`) {
        return;
    }

    ctx.reply(
        `Hi, I'm a bot to unpin messages in your group when you post on the connected channel.`,
    );
});

bot.on(`message`, async ctx => {
    if (ctx.message.sender_chat?.type === `channel`) {
        try {
            await ctx.unpinChatMessage(ctx.message.message_id);
        } catch (error) {
            console.error(error);
        }
    }
});
if (process.env.PORT && process.env.WEBHOOK_URL) {
    bot.launch({
        webhook: {
            domain: process.env.WEBHOOK_URL,
            port: process.env.PORT,
        },
    }).then(() =>
        console.log(
            `Bot is Online 🚀\nDOMAIN: ${process.env.WEBHOOK_URL}\nPORT: ${process.env.PORT}`,
        ),
    );
} else {
    bot.launch().then(() => console.log('Bot is Online  🚀'));
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

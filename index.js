require('dotenv').config({ quiet: true });

const crypto = require('crypto');
const http = require('http');
const { Bot, GrammyError, webhookCallback } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);

bot.catch(console.log);

bot.command(['start', 'help'], ctx => {
    if (ctx.chat.type !== 'private') {
        return;
    }

    return ctx.reply(
        "Hi, I'm a bot to unpin messages in your group when you post on the connected channel.",
    );
});

bot.on('message', async ctx => {
    if (
        ctx.message.is_automatic_forward &&
        ctx.message.sender_chat?.type === 'channel'
    ) {
        try {
            await ctx.unpinChatMessage(ctx.message.message_id);
        } catch (error) {
            if (
                error instanceof GrammyError &&
                error.description.includes('MESSAGE_ID_INVALID')
            ) {
                return;
            }

            if (
                error instanceof GrammyError &&
                error.description.includes(
                    'not enough rights to manage pinned messages',
                )
            ) {
                try {
                    await ctx.leaveChat();
                } catch (leaveError) {
                    console.error(leaveError);
                }
            } else {
                console.error(error);
            }
        }
    }
});

if (process.env.PORT && process.env.WEBHOOK_URL) {
    const url = /^https?:\/\//.test(process.env.WEBHOOK_URL)
        ? process.env.WEBHOOK_URL
        : `https://${process.env.WEBHOOK_URL}`;
    const secretToken = crypto.randomBytes(32).toString('hex');
    const server = http.createServer(
        webhookCallback(bot, 'http', { secretToken }),
    );

    server.listen(process.env.PORT, async () => {
        await bot.api.setWebhook(url, { secret_token: secretToken });

        console.log(`Bot is online 🚀`);
        console.log(`URL: ${process.env.WEBHOOK_URL}`);
        console.log(`Port: ${process.env.PORT}`);
    });

    // Enable graceful stop
    process.once('SIGINT', () => server.close());
    process.once('SIGTERM', () => server.close());
} else {
    bot.start({ onStart: () => console.log('Bot is online 🚀') });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop());
    process.once('SIGTERM', () => bot.stop());
}

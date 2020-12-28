require(`dotenv`).config();

const { Telegraf } = require(`telegraf`);
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch(console.log);

bot.command([`start`, `help`], ctx => {
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

bot.launch();

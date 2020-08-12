require(`dotenv`).config();

const path = require(`path`);
const NeDB = require(`nedb`);
const Telegraf = require(`telegraf`);
const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new NeDB({
    filename: path.join(__dirname, `db/chats.db`),
    autoload: true,
});

bot.catch(console.log);

bot.command([`start`, `help`], ctx => {
    ctx.reply(
        `Hi, I'm a bot to unpin/repin messages in your group when you post on the connected channel. I will automatically check for what message you want to pin so you don't have to worry about it!`
    );
});

bot.on(`new_chat_members`, ctx => {
    ctx.message.new_chat_members.forEach(async member => {
        if (member.id === ctx.botInfo.id) {
            const chat = await bot.telegram.getChat(ctx.chat.id);

            db.insert({
                chat_id: chat.id,
                pinned_message: chat.pinned_message
                    ? chat.pinned_message.message_id
                    : null,
            });
        }
    });
});

bot.on(`pinned_message`, async ctx => {
    const { message_id } = ctx.message.pinned_message;

    if (ctx.from.id === ctx.botInfo.id) {
        return await ctx.deleteMessage();
    }

    db.update(
        { chat_id: ctx.chat.id },
        { $set: { pinned_message: message_id } },
        { upsert: true }
    );
});

bot.on(`message`, async ctx => {
    if (ctx.chat.type !== `supergroup`) return;

    if (ctx.from.id === 777000) {
        db.findOne({ chat_id: ctx.chat.id }, async (err, chat) => {
            if (err) return console.error(err);

            if (!chat || !chat.pinned_message) {
                await ctx.unpinChatMessage();
            } else {
                await ctx.pinChatMessage(chat.pinned_message, {
                    disable_notification: true,
                });
            }
        });
    }
});

bot.launch();

// const { forwardTo } = require('prisma-binding');

const Query = {
    async item(parent, args, ctx, info) {
        const items = await ctx.db.query.items();
        return items
    }

    // items: forwardTo('db'),
};

module.exports = Query;

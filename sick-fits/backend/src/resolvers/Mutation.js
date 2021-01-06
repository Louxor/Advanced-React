const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  //definitions: https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );

    // console.log(item);

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id:args.id };
    // find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // check if own item (premission)
    // TO DO
    // delete
    return ctx.db.mutation.deleteItem( { where }, info );
  },

  async signup(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // Finalllllly we return the user to the browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email: email } });
    if(!user) {
      throw new Error(`No such user found for the email`);
    }
    // 2. check if pw correct
    const valid = await bcrypt.compare(password, user.password);
    if(!valid) {
      throw new Error(`Invalid password`);
    }
    // 3. generate jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set cookie with the token 
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 5. return the user
    return user;

  }

};

module.exports = Mutations;
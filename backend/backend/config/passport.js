const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key'
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // Find user by id from token payload
        const user = await User.findByPk(jwt_payload.id, {
          attributes: { exclude: ['password'] }
        });

        if (user) {
          // Ensure role is included from the token
          if (jwt_payload.role) {
            user.dataValues.role = jwt_payload.role;
          }
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        console.error('Error in JWT strategy:', error);
        return done(error, false);
      }
    })
  );
};

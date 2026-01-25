export default {
    jwt: {
        secret: process.env.APP_SECRET || 'default-secret',
        expiresIn: '1d',
    },
};

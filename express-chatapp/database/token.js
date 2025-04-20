const jwt = require('jsonwebtoken');

module.exports.validateToken = (req, res) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies.usertoken || req.cookies.signtoken;

        if(token) {
            jwt.verify(token, process.env.TOKEN_KEY, (err, key) => {
                if(err) {
                    return reject(res.json({err}));
                }
                else {
                    return resolve(key);
                }
            }); 
        } 
        else {
            return reject(null);
        }
    }); 
}
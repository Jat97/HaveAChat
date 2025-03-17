const jwt = require('jsonwebtoken');

module.exports.token;

module.exports.user_key;

module.exports.validateToken = (req, res) => {
    token = req.cookies.usertoken || req.cookies.signtoken;

    console.log(req, 'JKJKLFJ')

    if(token) {
        jwt.verify(token, process.env.TOKEN_KEY, (err, key) => {
            if(err) {
                res.json({err});
            }
            else {
                user_key = key;
            }
        });
    } 
    else {
        res.status(403).json({});
    }
}
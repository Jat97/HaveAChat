const db = require('../database/db');
const {upload, uploadImage} = require('../database/imageupload');
const {validateToken} = require('../database/token');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDate();
let minDate = new Date(year - 18, month, day).toISOString();

exports.create_account = [
    body('username', 'Please enter a username.').trim().custom(async name => {
        await db.query(`SELECT * FROM users WHERE username = $1`, [name]).then(async user => {
            if(user.rows.length > 0) {
                return Promise.reject('This username already exists.');
            }
        });
    }),
    body('email', 'Please enter a valid email address').trim().custom(async email => {
        await db.query(`SELECT * FROM users WHERE email = $1`, [email]).then(async address => {
            if(address.rows.length > 0) {
                return Promise.reject('This email is already in use.');
            }
        });
    }),
    body('display', 'Please enter a display name').isLength({min: 1}).trim(),
    body('dob', 'Please enter your birthday').custom(async birthdate => {
        if(birthdate > minDate) {
            return Promise.reject('You must be at least 18 to register.');
        }
    }),
    body('password', 'Please enter your password').trim().custom(async password => {
        if(password.length < 8) {
            return Promise.reject('Your password must be at least 8 characters');
        }
    }),
    body('confirm', 'Please reenter your password.').trim().custom(async (confirm, {req}) => {
        if(confirm !== req.body.password) {
            return Promise.reject('Your passwords do not match.');
        }
    }),

    (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.json({errors});
        }
        else {
            bcrypt.hash(req.body.password, 10, async (err, hashWord) => {
                if(err) {
                    res.json({err});
                }
                else {
                    const user = await db.query(
                        `INSERT INTO users (username, email, password, dob, online, hidden, profile_picture, display_name) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
                        [req.body.username, req.body.email, hashWord, req.body.dob, true, false, null, req.body.display]
                    );

                    jwt.sign({user, expiresIn: new Date(Date.now() + 1000000000)}, 
                        process.env.TOKEN_KEY, (err, key) => {
                        if(err) {
                            res.json({err});
                        }
                        else {
                            return res.cookie('signtoken', key, {
                                expires: new Date(Date.now() + 1000000000),
                                secure: false,
                                httpOnly: true,
                                path: '/api'
                            }).redirect(303, '/api/chats');
                        }
                    });
                }
            });
        }
    }
];

exports.log_in = async (req, res) => {
    const user = await db.query(`SELECT * FROM users WHERE username = $1 OR email = $1`, [req.body.user]);

    console.log(user.rows.length);

    if(user.rows.length === 0) {
        res.json({user_err: 'This account does not exist.'});
    }
    else {
        bcrypt.compare(req.body.password, user.rows[0].password, (err, result) => {
            if(err) {
                res.json({err});
            }
            else if(result) {
                jwt.sign({user, expiresIn: new Date(Date.now() + 1000000000)}, process.env.TOKEN_KEY, async (err, key) => {
                    if(err) {
                        res.json({err});
                    }
                    else {
                        await db.query(`UPDATE users SET online = $1 WHERE id = $2`, [true, user.rows[0].id]);

                        res.cookie('usertoken', key, {
                            expires: new Date(Date.now() + 1000000000),
                            secure: false,
                            httpOnly: true,
                            path: '/api'
                        }).redirect(303, '/api/chats');
                    }
                });
            }
            else {
                res.json({pass_err: 'Your password is incorrect.'});
            }
        });
    }
};

exports.user_index = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const users = await db.query(`SELECT * FROM users WHERE id != $1`, 
                [user_key.user.rows[0].id]);

            const blocked_users = await db.query(`SELECT * FROM blocked_users WHERE blocked_by = $1`, 
                [user_key.user.rows[0].id]);

            if(blocked_users.rows.length > 0) {
                users.rows.filter(user => blocked_users?.some((blocked) => blocked.id === user.id) === false); 
            }

            res.status(200).json({users: users.rows});
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.change_profile_picture = async (req, res) => {
    try {
        const user_key = await validateToken(req, res); 

        if(user_key) {
            let result;

            if(req.file) {
                result = await uploadImage(req);
            }
            
            if(result) {
                await db.query(
                    `UPDATE users SET profile_picture = $1 WHERE id = $2`, 
                    [result.secure_url, user_key.user.rows[0].id]
                );

                res.status(200).json({});
            }
            else {
                res.json({err: 'Unable to upload image.'});
            }
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
}   

exports.get_friends = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const friends = await db.query(
                `SELECT * FROM friends 
                WHERE user1 = $1`, [user_key.user.rows[0].id]
            );

            const users = await db.query(`SELECT * FROM users`);

            const friendslist = [];

            friends.rows.forEach(friend => {
                users.rows.forEach(user => {
                    if(user.id === friend.user2) {
                        friendslist.push(user);
                    }
                    else {
                        return null;
                    }
                })
            });

            res.json({friends: friendslist});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.get_blocked_users = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const blocked_users = await db.query(`
                SELECT * FROM blocked_users
                WHERE blocked_by = $1`, [user_key.users.rows[0].id]
            );

            const users = await db.query(`SELECT * FROM users`);

            const blocklist = [];

            blocked_users.forEach(blocked => {
                users.forEach(user => {
                    if(blocked.blocked_user === user.id) {
                        blocklist.push(user);
                    }
                });
            });

            res.json({blocked_users: blocklist});
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.remove_from_friendslist = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            await db.query(
                `DELETE FROM friends 
                JOIN users ON user.id = friends.user1.id
                WHERE user1.id = $1 AND user2.username = $2`, [user_key.users.rows[0].id, req.params.username]
            );
            
            res.status(200).json({});
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.toggle_block_users = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const blocked_user = await db.query(
                `SELECT blocked_user FROM blocked_users 
                JOIN users ON user.id = blocked_users.blocked_by.id
                WHERE blocked_user.username = $1`, [req.params.username]
            );

            if(blocked_user.rows.length > 0) {
                await db.query(
                    `DELETE FROM blocked_users 
                    JOIN users ON user.id = blocked_users.blocking_user.id
                    WHERE blocked_user.username = $1 AND blocked_by.id = $2`, 
                    [req.params.username, user_key.users.rows[0].id] 
                );
            }
            else {
                const user = await db.query(`SELECT * FROM users WHERE username = $1`, [req.params.username]);

                await db.query(
                    `INSERT INTO blocked_users (blocked_user, blocked_by) VALUES ($1, $2)`, 
                    [user.rows[0], user_key.users.rows[0]]
                );

                await db.query(
                    `DELETE FROM chats WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`, 
                    [user_key.user.rows[0].id, user.rows[0].id]
                );

                await db.query(
                    `DELETE FROM messages WHERE (sending_user = $1 AND receiving_user = $2) 
                    OR (sending_user = $2 AND receiving_user = $1)`, 
                    [user_key.user.rows[0].id, user.rows[0].id]
                );
            }

            res.status(200).json({blocked_user});
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.toggle_online_status = async (req, res) => {
    try {
        const user_key = validateToken(req, res);

        if(user_key) {
            
            await db.query(`UPDATE users SET online = $1 AND hidden = $2 WHERE id = $3`, 
                [user_key.user.rows[0].online ? false : true, user_key.user.rows[0].hidden ? false : true, 
                    user_key.user.rows[0].id]);
            
            res.status(200).json({});
           
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.search_users = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const search_query = `%${req.query.query}%`;

            const search_results = await db.query(
                `SELECT * FROM users WHERE username LIKE $1 OR display_name LIKE $1`, [search_query]
            );

            res.json({users: search_results.rows}); 
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
}

exports.delete_account = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            await db.query(`DELETE FROM users WHERE = $1`, [user_key.users.rows[0].id]);

            res.status(200).json({});
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.get_logged_data = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            res.json({logged_user: user_key.user.rows[0]});
        }
        else {
            res.status(403).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.log_out = async (req, res) => {
    try {
      const user_key = await validateToken(req, res);  

      if(user_key) {
        await db.query(`UPDATE users SET online = $1 WHERE id = $2`, [false, user_key.user.rows[0].id]);

        res.clearCookie(req.cookies.usertoken ? 'usertoken' : 'signtoken', {domain: 'localhost', path: '/api'})
            .redirect(303, '/api/login');
      }
      else {
        res.status(403).json({});
      }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
}
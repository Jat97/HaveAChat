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
            res.json({errors: errors});
        }
        else {
            bcrypt.hash(req.body.password, 10, async (err, hashWord) => {
                if(err) {
                    res.status(500).json({error: err});
                }
                else {
                    const user = await db.query(
                        `INSERT INTO users (username, email, password, dob, online, hidden, profile_picture, display_name) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                        RETURNING username, display_name, profile_picture, online, hidden`, 
                        [req.body.username, req.body.email, hashWord, req.body.dob, true, false, null, req.body.display]
                    );

                    jwt.sign({user, expiresIn: new Date(Date.now() + 1000000000)}, 
                        process.env.TOKEN_KEY, (err, key) => {
                        if(err) {
                            res.status(400).json({err});
                        }
                        else {
                            return res.cookie('signtoken', key, {
                                expires: new Date(Date.now() + 1000000000),
                                secure: false,
                                httpOnly: true,
                                path: '/api'
                            }).sendStatus(201);
                        }
                    });
                }
            });
        }
    }
];

exports.log_in = async (req, res) => {
    const user = await db.query(`
        SELECT *
        FROM users 
        WHERE username = $1 OR email = $1`, 
        [req.body.user]
    );

    if(user.rows.length === 0) {
        res.json({user_err: 'This account does not exist.'});
    }
    else {
        bcrypt.compare(req.body.password, user.rows[0].password, (err, result) => {
            if(err) {
                res.status(500).json({error: err});
            }
            else if(result) {
                const logged_user = user.rows[0];

                jwt.sign({logged_user, expiresIn: new Date(Date.now() + 1000000000)}, process.env.TOKEN_KEY, 
                    async (err, key) => {
                    if(err) {
                        res.json({err});
                    }
                    else {
                        await db.query(
                            `UPDATE users SET online = $1 WHERE id = $2`, 
                            [true, user.rows[0].id]
                        );

                        res.cookie('usertoken', key, {
                            expires: new Date(Date.now() + 1000000000),
                            secure: false,
                            httpOnly: true,
                            path: '/api'
                        }).sendStatus(200);
                    }
                });
            }
            else if(req.body.password.length === 0) {
                res.status(400).json({pass_err: 'Please enter your password.'});
            }
            else {
                res.status(400).json({pass_err: 'Your password is incorrect.'});
            }
        });
    }
};

exports.user_index = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            let users = await db.query(`
                SELECT username as username,
                display_name as display_name,
                profile_picture as profile_picture,
                online as online,
                hidden as hidden 
                FROM users 
                WHERE id != $1`, 
                [user_key.logged_user.id]
            );

            const blocked_users = await db.query(
                `SELECT * FROM blocked_users WHERE blocked_by = $1`, 
                [user_key.logged_user.id]
            );

            if(blocked_users.rows.length > 0) {
                users.rows = users.rows.filter(user => blocked_users.rows.some((blocked) => blocked !== user.id)); 
            }

            res.status(200).json({users: users.rows});
        }
        else {
            res.sendStatus(401);
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
                var updated_user = await db.query(
                    `UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING profile_picture`, 
                    [result.secure_url, user_key.logged_user.id]
                );

                res.status(200).json({updated_user: updated_user.rows[0]});
            }
            else {
                res.status(400).json({image_error: 'Unable to upload image.'});
            }
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
}   

exports.remove_from_friendslist = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const unfriended_user = await db.query(
                `SELECT * 
                FROM users
                WHERE username = $1`,
                [req.params.username]
            );
            
            await db.query(
                `DELETE FROM friends
                WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`,
                [user_key.logged_user.id, unfriended_user.rows[0].id]
            );
            
            res.sendStatus(200);
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.block_user = async (req, res) => {
    try{
        const user_key = await validateToken(req, res);
        
        if(user_key) {
            const user = await db.query(
                `SELECT * FROM users WHERE username = $1`,
                [req.params.username]
            );

            const new_block = await db.query(
                `INSERT INTO blocked_users (blocked_user, blocked_by) 
                VALUES ($1, $2)
                RETURNING *`,
                [user.rows[0].id, user_key.logged_user.id] 
            );

            await db.query(
                `DELETE FROM chats 
                WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`,
                [user_key.logged_user.id, user.rows[0].id]
            );

            await db.query(
                `DELETE FROM messages 
                WHERE (sending_user = $1 AND receiving_user = $2) OR (sending_user = $2 AND receiving_user = $1)`,
                [user_key.logged_user.id, user.rows[0].id]
            );

            await db.query(
                `DELETE FROM chat_requests
                WHERE (requesting_user = $1 AND requested_user = $2) OR (requesting_user = $2 AND requested_user = $1)`,
                [user_key.logged_user.id, user.rows[0].id]
            );

            await db.query(
                `DELETE FROM friends
                WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`,
                [user_key.logged_user.id, user.rows[0].id] 
            )

            res.status(201).json({new_block: new_block.rows[0]});
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.unblock_user = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const user = await db.query(
                `SELECT * FROM users 
                WHERE username = $1`,
                [req.params.username]
            );

            await db.query(
                `DELETE FROM blocked_users
                WHERE blocked_user = $1 AND blocked_by = $2`,
                [user.rows[0].id, user_key.logged_user.id]
            );

            res.sendStatus(200);
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.toggle_hidden_status = async (req, res) => {
    try {
        const user_key = validateToken(req, res);

        if(user_key) {
            const hidden_status = await db.query(`
                UPDATE users SET hidden = $1 WHERE id = $2 RETURNING id, hidden`, 
                [user_key.logged_user.hidden ? false : true, user_key.logged_user.id]
            );
            
            res.status(200).json({hidden_status: hidden_status.rows[0]});
           
        }
        else {
            res.status(401).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.delete_account = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            await db.query(`DELETE FROM users WHERE = $1`, [user_key.logged_user.id]);

            res.sendStatus(200);
        }
        else {
            res.sendStatus(401);
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
            const friends = await db.query(
                `SELECT id,
                username,
                display_name,
                profile_picture
                online,
                hidden
                FROM friends
                WHERE user1 = $1`,
                [user_key.logged_user.id]
            );

            const blocked_users = await db.query(
                `SELECT id,
                username,
                display_name
                profile_picture
                FROM blocked_users
                WHERE blocked_by = $1`,
                [user_key.logged_user.id]
            );

            res.status(200).json({
                logged_user: user_key.logged_user,
                friends: friends.rows,
                blocked_users: blocked_users.rows 
            });
        }
        else {
            res.sendStatus(401);
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
        await db.query(`UPDATE users SET online = $1 WHERE id = $2`, [false, user_key.logged_user.id]);

        res.clearCookie(req.cookies.usertoken ? 'usertoken' : 'signtoken', {domain: 'localhost', path: '/api'});
      }
      else {
        res.status(401).json({});
      }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
}
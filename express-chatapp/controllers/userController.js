const pool = require('../database/db');
const {upload, result, uploadImage} = require('../database/imageupload');
const {token, user_key, validateToken} = require('../database/token');
const jwt = require('jsonwebtoken');
const {body, validationCheck} = require('express-validator');
const bcrypt = require('bcryptjs');

exports.create_account = [
    body('username', 'Please enter a username.').trim().custom(async name => {
        await pool.query(`SELECT * FROM users WHERE username = ${name}`).then(async user => {
            if(user !== null) {
                return Promise.reject('This username already exists.');
            }
        });
    }),
    body('email', 'Please enter a valid email address').trim().custom(async email => {
        await pool.query(`SELECT * FROM users WHERE email = ${email}`).then(async address => {
            if(address !== null) {
                return Promise.reject('This email is already in use.');
            }
        })
    }),
    body('display', 'Please enter a display name').isLength({min: 1}).trim(),
    body('dob', 'Please enter your birthday').custom(async birthdate => {
        if(birthdate < dob) {
            return Promise.reject('You must be at least 18 to register.');
        }
    }),
    body('password', 'Please enter your password').trim().custom(async password => {
        if(password.length < 8) {
            return Promise.reject('Your password must be at least 8 characters');
        }
    }),
    body('confirm', 'Please reenter your password.').trim().custom(async confirm => {
        if(confirm !== req.body.password) {
            return Promise.reject('Your passwords do not match.');
        }
    }),

    upload.single('profile'), (req, res) => {
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
                    const user = await pool.query(
                        `INSERT INTO users (username, email, password, dob, display_name) VALUES ($1)`, 
                        [req.body.username, req.body.email, hashWord, req.body.dob, req.body.name]
                    );

                    jwt.sign({user, expiresIn: new Date(Date.now() + 1000000000)}),
                        process.env.TOKEN_KEY, (err, key) => {
                            if(err) {
                                res.json({err});
                            }
                            else {
                                res.cookie('signtoken', key, {
                                    expires: new Date(Date.now() + 1000000000),
                                    secure: false,
                                    httpOnly: true,
                                    path: '/api'
                                }).status(200).redirect('/api/chats');
                            }
                        }
                }
            });
        }
    }
];

exports.log_in = async (req, res) => {
    const user = await pool.query(`SELECT * FROM users WHERE username = ${req.body.user} OR email = ${req.body.user}`);

    if(user === null) {
        res.json({user_err: 'This account does not exist.'});
    }
    else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(err) {
                res.json({err});
            }
            else if(result) {
                jwt.sign(user, {expresIn: new Date(Date.now() + 1000000000)}, process.env.TOKEN_KEY, (err, key) => {
                    if(err) {
                        res.json({err});
                    }
                    else {
                        res.cookie('usertoken', key, {
                            expires: new Date(Date.now() + 1000000000),
                            secure: false,
                            httpOnly: true,
                            path: '/api'
                        }).status(200).redirect('/api/chats');
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
    validateToken(req, res);

    if(token) {
        const users = await pool.query(`SELECT * FROM users WHERE id IS NOT ${user_key.user.id}`);
        const blocked_users = await pool.query(`SELECT * FROM blocked_users WHERE blocked_by = ${user_key.user.id}`);

        users.filter(user => blocked_users.some((blocked) => blocked.id === user.id) === false);

        res.status(200).json({users});
    }
};

exports.change_profile_picture = [
    upload.single('profile'),
    async (req, res) => {
        validateToken(req, res);

        if(token) {
            uploadImage(req);
            
            if(result !== undefined) {
                await pool.query(`UPDATE TABLE users SET profile = ${result.secure_url} WHERE id = ${user_key.user.id}`);

                res.status(200).json({});
            }
            else {
                res.json({err: 'Something went wrong.'});
            }
        } 
    }   
];

exports.get_friends = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const friends = await pool.query(
            `SELECT * FROM friends 
            JOIN users ON users.id = user2
            WHERE user1 = ${user_key.user.id}`
        );

        res.json({friends: friends.rows});
    }
};

exports.get_blocked_users = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const blocked_users = await pool.query(`SELECT * FROM blocked_users
            JOIN users ON users.id = blocked_user
            WHERE blocked_by = ${user_key.user.id}`
        );

        res.json({blocked_users: blocked_users.rows});
    }
};

exports.toggle_user_friends = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const friend = await pool.query(
            `SELECT * FROM friends 
            JOIN users ON user.id = friends.user1.id
            WHERE user1.id = ${user_key.user.id} AND user2.username = ${req.params.username}`);

        
        await pool.query(
            friend === null ? 
            `INSERT INTO friends (user1, user2) VALUES (${user_key.user}, ${friend})` 
        : 
            `DELETE FROM friends 
            JOIN users ON user.id = friends.user1.id
            WHERE user1.id = ${user_key.user.id} AND user2.username = ${req.params.username}`
        );

        res.status(200).json({});
    }
};

exports.toggle_block_users = async (req, res) => {
    validateToken(req, res);
 
    if(token) {
        const blocked_user = await pool.query(
            `SELECT * FROM blocked_users 
            JOIN users ON user.id = blocked_users.blocking_user.id
            WHERE blocked_user.username = ${req.params.username}`);
        
        await pool.query(
            blocked_user === null ? 
            `INSERT INTO blocked_users (blocked_user, blocked_by) VALUES (${blocked_user}, ${user_key.user})` 
        :
            `DELETE FROM blocked_users 
            JOIN users ON user.id = blocked_users.blocking_user.id
            WHERE blocked_user.username = ${req.params.username} AND blocked_by.id = ${user_key.user.id}`  
        );

        res.status(200).json({blocked_user});
    }
};

exports.search_users = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const search_query = `%${req.query.query}%`

        const search_results = await pool.query(
            `SELECT * FROM users WHERE username = $1 OR display_name = $1`, [search_query]
        );

        res.json({users: search_results}); 
    }
}

exports.delete_account = async (req, res) => {
    validateToken(req, res);

    if(token) {
        await pool.query(`DELETE FROM users WHERE = ${user_key.user.id}`);

        res.status(200).json({});
    }
};

exports.get_logged_data = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const logged_user = await pool.query(`SELECT * FROM users WHERE id = ${user_key.user.id}`);

        res.json({logged_user: logged_user.rows[0]});
    }
}
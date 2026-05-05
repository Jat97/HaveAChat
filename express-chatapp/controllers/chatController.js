const db = require(`../database/db`);
const {uploadImage} = require(`../database/imageupload.js`);
const {validateToken} = require(`../database/token`);

exports.get_chats = async (req, res) => {
    try {
      const user_key = await validateToken(req, res);
        
        if(user_key) {
            const chats = await db.query(
                `SELECT chats.id, 
                users.id AS user_id,
                users.display_name AS display_name, 
                users.username AS username, 
                users.profile_picture AS profile_picture, 
                users.online AS online,
                users.hidden AS hidden 
                messages.checked AS checked 
                FROM chats 
                LEFT JOIN users ON users.id = chats.user2
                WHERE chats.user1 = $1`, 
                [user_key.logged_user.id]
            );

            const user_chats = [];

            for(const chat of chats.rows) { 
                const messages = await db.query(
                    `SELECT * 
                    FROM messages
                    WHERE (sending_user = $1 AND receiving_user = $2) OR (sending_user = $2 AND receiving_user = $1)`,
                    [user_key.logged_user.id, chat.user2]
                );
                
                const chat_obj = {
                    id: chat.id,
                    user: {
                        id: chat.user_id,
                        display_name: chat.display_name,
                        username: chat.username,
                        profile_picture: chat.profile_picture,
                        online: chat.online,
                        hidden: chat.hidden
                    },
                    messages: messages.rows  
                }
                
                const request = await db.query(
                    `SELECT id,
                    requesting_user 
                    FROM chat_requests 
                    WHERE requesting_user = $1`,
                    [chat_obj.user.id]
                );

                user_chats.push(
                    {
                        chat: chat_obj,  
                        request: request.rows.length > 0 ? request.rows[0] : null
                    }
                );
            }

            res.status(200).json({chats: user_chats});  
        }
        else {
            res.status(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.create_chat = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const user = await db.query(
                `SELECT * 
                FROM users
                WHERE username = $1`,
                [req.params.username]
            );

            const new_chat = await db.query(
                `INSERT INTO chats (user1, user2)
                VALUES ($1, $2)
                RETURNING *`,
                [user_key.logged_user.id, user.rows[0].id]
            );

            res.sendStatus(201).json({chat: new_chat.rows[0]});
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.send_message = async (req, res) => { 
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            let result;

            if(req.file !== undefined) {
                result = await uploadImage(req); 
            } 

            const receiving_user = await db.query(
                `SELECT * FROM users WHERE username = $1`, 
                [req.params.username]
            );
            
            const user_chat = await db.query(
                `SELECT * FROM chats WHERE user1 = $1 AND user2 = $2`,
                [user_key.logged_user.id, receiving_user.rows[0].id]
            );

            let partner_chat = await db.query(
                `SELECT * FROM chats WHERE user1 = $1 AND user2 = $2`, 
                [receiving_user.rows[0].id, user_key.logged_user.id]
            );

            const message = await db.query(
                `INSERT INTO messages (sending_user, receiving_user, text, sent, checked, image)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, 
                [
                    user_key.logged_user.id, 
                    receiving_user.rows[0].id, 
                    req.body.text, 
                    new Date(Date.now()), 
                    false, 
                    !result ? null : result.secure_url
                ]
            );

            await db.query(
                `UPDATE chats SET WHERE user1 = $1 AND user2 = $2`, 
                [user_key.logged_user.id, receiving_user.rows[0].id]
            );

            if(partner_chat.rows.length === 0) {
                await db.query(
                    `INSERT INTO chats (user1, user2) VALUES ($1, $2)`, 
                    [receiving_user.rows[0].id, user_key.logged_user.id, message.rows[0].id]
                );

                await db.query(
                    `INSERT INTO chat_requests (requesting_user, requested_user) VALUES ($1, $2)`, 
                    [user_key.logged_user.id, receiving_user.rows[0].id]
                );
            }

            res.status(201).json({message: message.rows[0]});
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }  
};

exports.accept_chat_request = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const request = await db.query(`SELECT * FROM chat_requests WHERE id = $1`, [req.params.requestid]);
            
            const new_friend = await db.query(`INSERT INTO friends (user1, user2) VALUES ($1, $2) RETURNING *`, 
                [user_key.logged_user.id, request.rows[0].requesting_user]
            );

            await db.query(`INSERT INTO friends (user1, user2) VALUES ($1, $2)`, 
                [request.rows[0].requesting_user, user_key.logged_user.id]
            );
            
            await db.query(`DELETE FROM chat_requests WHERE id = $1`, [request.rows[0].id]);

            res.status(201).json({new_friend: new_friend.rows[0]});
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.reject_chat_request = async (req, res) => {
    try {
        const user_key = validateToken(req, res);

        if(user_key) {
            await db.query(`DELETE FROM chats WHERE user1 = $1 AND user2 = $2`, 
                [user_key.logged_user.id, request.rows[0].requesting_user]
            );

            await db.query(`DELETE FROM chats WHERE user1 = $1 AND user2 = $2`, 
                [request.rows[0].requesting_user, user_key.logged_user.id]
            );

            await db.query(`DELETE FROM messages WHERE sending_user = $1 AND receiving_user = $2`, 
                [user_key.logged_user.id, request.rows[0].requesting_user]
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

exports.delete_chat = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            await db.query(`DELETE FROM chats WHERE id = $1`, [req.params.chatid]);

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
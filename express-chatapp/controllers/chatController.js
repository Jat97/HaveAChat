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
                users.hidden AS hidden,
                messages.text AS text,
                messages.sending_user AS sending_user,
                messages.sent AS sent, 
                messages.checked AS checked 
                FROM chats 
                LEFT JOIN messages ON messages.id = chats.last_message_sent 
                LEFT JOIN users ON users.id = chats.user2
                WHERE chats.user1 = $1`, [user_key.logged_user.id]
            );

            const user_chats = chats.rows.map(chat => ({
                id: chat.id,
                user2: {
                    id: chat.user_id,
                    display_name: chat.display_name,
                    username: chat.username,
                    profile_picture: chat.profile_picture,
                    online: chat.online,
                    hidden: chat.hidden
                },
                last_message_sent: {
                    text: chat.text,
                    sending_user: chat.sending_user,
                    sent: chat.sent,
                    checked: chat.checked
                }
            }));

            res.json({chats: user_chats.sort((a, b) => a.last_message_sent.sent > b.last_message_sent.sent ? -1 : 1)});  
        }
        else {
            res.status(401).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.get_user_messages = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const user = await db.query(`SELECT * FROM users WHERE username=$1`, [req.params.username]);

            const messages = await db.query(
                `SELECT messages.id, messages.text, messages.sending_user, messages.receiving_user, 
                messages.sent, messages.checked, messages.image FROM messages 
                LEFT JOIN users AS sender ON sender.id = messages.sending_user
                LEFT JOIN users AS receiver ON receiver.id = messages.receiving_user
                WHERE (sender.id = $1 AND receiver.id = $2) 
                OR (sender.id = $2 AND receiver.id = $1)`, 
                [user_key.logged_user.id, user.rows[0].id]
            );

            const request = await db.query(`
                SELECT * FROM chat_requests 
                WHERE requested_user = $1 AND requesting_user = $2`, 
                [user_key.logged_user.id, user.rows[0].id]
            );

            for(const message of messages.rows) {
                if(message.receiving_user === user_key.logged_user.id && message.checked === false) {
                    await db.query(
                        `UPDATE messages SET checked = $1 WHERE sending_user = $2`, [true, message.sending_user]
                    );
                }
            }

            res.json({
                messages: messages.rows.sort((a, b) => a.sent > b.sent ? 1 : -1), 
                request: request.rows.length === 0 ? null : request.rows[0]
            });
        }
        else {
            res.status(401).json({});
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

            const receiving_user = await db.query(`SELECT * FROM users WHERE username = $1`, [req.params.username]);
            
            const user_chat = await db.query(`SELECT * FROM chats WHERE user1 = $1 AND user2 = $2`,
                [user_key.logged_user.id, receiving_user.rows[0].id]
            );

            let partner_chat = await db.query(`SELECT * FROM chats WHERE user1 = $1 AND user2 = $2`, 
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

            await db.query(`UPDATE chats SET last_message_sent = $1 WHERE user1 = $2 AND user2 = $3`, 
                [message.rows[0].id, user_key.logged_user.id, receiving_user.rows[0].id]
            );

            if(partner_chat.rows.length === 0) {
                partner_chat = await db.query(`INSERT INTO chats (user1, user2, last_message_sent) VALUES ($1, $2, $3)
                    RETURNING *`, 
                    [receiving_user.rows[0].id, user_key.logged_user.id, message.rows[0].id]
                );

                await db.query(`INSERT INTO chat_requests (requesting_user, requested_user) VALUES ($1, $2)`, 
                    [user_key.logged_user.id, receiving_user.rows[0].id]
                );
            }
            
            await db.query(`UPDATE chats SET last_message_sent = $1 WHERE id = $2`,
                [message.rows[0].id, partner_chat.rows[0].id]
            );
            
            await db.query(`UPDATE chats SET last_message_sent = $1 WHERE id = $2`, 
                [message.rows[0].id, user_chat.rows[0].id]
            );

            res.status(200).json(message.rows[0]);
        }
        else {
            res.status(401).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }  
}

exports.accept_chat_request = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const request = await db.query(`SELECT * FROM chat_requests WHERE id = $1`, [req.params.requestid]);
            
            await db.query(`INSERT INTO friends (user1, user2) VALUES ($1, $2)`, 
                [user_key.logged_user.id, request.rows[0].requesting_user]
            );

            await db.query(`INSERT INTO friends (user1, user2) VALUES ($1, $2)`, 
                [request.rows[0].requesting_user, user_key.logged_user.id]
            );
            
            await db.query(`DELETE FROM chat_requests WHERE id = $1`, [request.rows[0].id]);

            res.status(200).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.reject_chat_request = async (req, res) => {
    try {
        const user_key = validateToken(req, res);

        await db.query(`DELETE FROM chats WHERE user1 = $1 AND user2 = $2`, 
            [user_key.logged_user.id, request.rows[0].requesting_user]
        );

        await db.query(`DELETE FROM chats WHERE user1 = $1 AND user2 = $2`, 
            [request.rows[0].requesting_user, user_key.logged_user.id]
        );

        await db.query(`DELETE FROM messages WHERE sending_user = $1 AND receiving_user = $2`, 
            [user_key.logged_user.id, request.rows[0].requesting_user]
        );

        res.status(200).json({});
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};

exports.handle_chat_request = async (req, res) => {
    try {
        const user_key = await validateToken(req, res);

        if(user_key) {
            const request = await db.query(`SELECT * FROM chat_requests WHERE id = $1`, [req.params.requestid]);

            if(req.body.accept === 'false') {
                await db.query(`DELETE FROM chats WHERE user1 = $1 AND user2 = $2`, 
                    [user_key.logged_user.id, request.rows[0].requesting_user]
                );

                await db.query(`DELETE FROM chats WHERE user1 = $1 AND user2 = $2`, 
                    [request.rows[0].requesting_user, user_key.logged_user.id]
                );

                await db.query(`DELETE FROM messages WHERE sending_user = $1 AND receiving_user = $2`, 
                    [user_key.logged_user.id, request.rows[0].requesting_user]
                );
            }
            else {    
                await db.query(`INSERT INTO friends (user1, user2) VALUES ($1, $2)`, 
                    [user_key.logged_user.id, request.rows[0].requesting_user]
                );

                await db.query(`INSERT INTO friends (user1, user2) VALUES ($1, $2)`, 
                    [request.rows[0].requesting_user, user_key.logged_user.id]
                );
            }

            await db.query(`DELETE FROM chat_requests WHERE id = $1`, [request.rows[0].id]);

            res.status(200).json({});
        }
        else {
            res.status(401).json({});
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

            res.status(200).json({});
        }
    }
    catch (err) {
        res.status(500).json({error: err});
    }
};
const pool = require(`../database/db`);
const {upload, result, uploadImage} = require(`../database/imageupload.js`);
const {token, user_key, validateToken} = require(`../database/token`);

exports.get_chats = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const chats = await pool.query(
            `SELECT * FROM chats 
            JOIN messages ON messages.id = chats.last_message_sent 
            WHERE user1 = ${user_key.user.id}`
        );

        res.json({chats: chats.rows});
    }
};

exports.get_user_messages = async (req, res) => {
    validateToken(req, res);

    if(token) {
        const messages = await pool.query(
            `SELECT * FROM messages 
            WHERE (sending_user.username = ${user_key.user.username} AND receiving_user.username = ${req.params.username}) 
            OR (sending_user.username = ${req.params.username} AND receiving_user.username = ${user_key.user.username}`
        );

        res.json({messages: messages.rows});
    }
};

exports.send_message = [
    upload.single('chat'),
    async (req, res) => {
        validateToken(req, res);

        if(token) {
            await pool.query(
                `INSERT INTO messages (sending_user, receiving_user, text, sent, checked)
                VALUES ($1)`, 
                [user_key.user.id, req.params.userid, req.body.text, new Date(Date.now()), false]
            );
            
            res.status(200).json({});
        }
    }
];

exports.delete_chat = async (req, res) => {
    validateToken(req, res);

    if(token) {
        await pool.query(`DELETE FROM chats WHERE id = ${req.params.chatid}`);

        res.status(200).json({});
    }
};
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const userController = require('../controllers/userController');

//User Functions //

router.post('/signup', userController.create_account);

router.post('/login', userController.log_in);

router.get('/index', userController.user_index);

router.put('/profile/picture', userController.change_profile_picture);

router.get('/friends', userController.get_friends);

router.get('/blocked', userController.get_blocked_users);

router.put('/:username/friend/toggle', userController.toggle_user_friends);

router.put('/:username/block/toggle', userController.toggle_block_users);

router.get('/search?:query', userController.search_users);

router.delete('/user/delete', userController.delete_account);

router.get('/user', userController.get_logged_data);

//Chat Functions //

router.get('/chats', chatController.get_chats);

router.get('/:username/chat', chatController.get_user_messages);

router.put('/:userid/message', chatController.send_message);

router.delete('/:chatid/chat/delete', chatController.delete_chat);

module.exports = router;
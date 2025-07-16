const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const userController = require('../controllers/userController');
const {upload} = require('../database/imageupload');

//User Functions //

router.post('/signup', userController.create_account);

router.post('/login', userController.log_in);

router.get('/users', userController.user_index);

router.patch('/profile/picture', upload.single('profilepicture'), userController.change_profile_picture);

router.get('/friends', userController.get_friends);

router.get('/blocked', userController.get_blocked_users);

router.delete('/unfriend/:username', userController.remove_from_friendslist);

router.post('/block/:username', userController.toggle_block_users);

router.delete('/unblock/:username', userController.toggle_block_users);

router.patch('/user/hidden/toggle', userController.toggle_hidden_status);

router.get('/search?:query', userController.search_users);

router.delete('/user', userController.delete_account);

router.get('/user', userController.get_logged_data);

router.put('/user/logout', userController.log_out);

//Chat Functions //

router.get('/chats', chatController.get_chats);

router.get('/:username/chat', chatController.get_user_messages);

router.post('/:username/message', upload.single('chatimage'), chatController.send_message);

router.put('/chat/:requestid/request/handle', chatController.handle_chat_request);

router.delete('/:chatid/chat', chatController.delete_chat);

module.exports = router;
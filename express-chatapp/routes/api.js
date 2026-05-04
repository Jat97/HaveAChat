const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const userController = require('../controllers/userController');
const {upload} = require('../database/imageupload');

//User Functions //

router.post('/signup', userController.create_account);

router.post('/login', userController.log_in);

router.get('/users', userController.user_index);

router.patch('/user/picture', upload.single('profilepicture'), userController.change_profile_picture);

router.delete('/:username/unfriend', userController.remove_from_friendslist);

router.post('/:username/block', userController.block_user);

router.delete('/:username/unblock', userController.unblock_users);

router.patch('/user/hidden', userController.toggle_hidden_status);

router.delete('/user', userController.delete_account);

router.get('/user', userController.get_logged_data);

router.patch('/user/logout', userController.log_out);

//Chat Functions //

router.get('/chats', chatController.get_chats);

router.post('/chat/:username', chatController.initiate_chat);

router.post('/:username/message', upload.single('chatimage'), chatController.send_message);

router.post('/chat/:requestid/accept', chatController.accept_chat_request);

router.delete('/chat/:requestid/reject', chatController.reject_chat_request);

router.delete('/:chatid/chat', chatController.delete_chat);

module.exports = router;
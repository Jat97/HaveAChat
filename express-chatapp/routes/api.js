const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const userController = require('../controllers/userController');
const {upload} = require('../database/imageupload');

//User Functions //

router.post('/signup', userController.create_account);

router.post('/login', userController.log_in);

router.get('/users', userController.user_index);

router.put('/profile/picture', upload.single('profile'), userController.change_profile_picture);

router.get('/friends', userController.get_friends);

router.get('/blocked', userController.get_blocked_users);

router.put('/:username/friend/remove', userController.remove_from_friendslist);

router.put('/:username/block/toggle', userController.toggle_block_users);

router.put('/user/online/toggle', userController.toggle_online_status);

router.get('/search?:query', userController.search_users);

router.delete('/user/delete', userController.delete_account);

router.get('/user', userController.get_logged_data);

router.put('/user/logout', userController.log_out);

//Chat Functions //

router.get('/chats', chatController.get_chats);

router.put('/:username/chat/initiate', chatController.initiate_chat);

router.get('/:username/chat', chatController.get_user_messages);

router.put('/:username/message', upload.single('chat'), chatController.send_message);

router.put('/chat/:requestid/request/handle', chatController.handle_chat_request);

router.delete('/:chatid/chat/delete', chatController.delete_chat);

module.exports = router;
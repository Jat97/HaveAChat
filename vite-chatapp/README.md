# ChatApp

## Overview

A simple app to send and receive messages from other users. Users can also add friends by accepting chat requests that have been sent to them, or they can block users. There is also a search feature that allows users to find and contact others.

## Table of Contents

+ [Authentication & Authorization](#authentication--authorization)
+ [Users](#users)
+ [Friends](#friends)
+ [Blocked](#blocked)
+ [Chats](#chats)
+ [Search](#search) 

## Authentication & Authorization

When a request is sent to the API, the server checks for one of two JSONWebTokens in the request’s Cookie header:

1. usertoken: This token is sent to the client for users that are logging into an established account.

2. signtoken: This token is sent to the client for users accessing the application through a newly-created account.

If neither token can be read, then the server returns a 401 HTTP status code, blocking access to the API.

## Users

Users are the accounts that have been created for use on this platform.
 
### User Methods

| Endpoint | Method | Description|
|----------|--------|------------|
| /api/users | GET | Get all available users|
| /api/user | GET | Retrieve your account information |
| /api/signup | POST | Create your own account |
| /api/login | POST | Log in to your existing account |
| /api/profile/picture | PATCH | Set or edit your profile picture |
| /api/user/hidden/toggle | PATCH | Toggle whether or not users can see when you're online |
| /api/user/logout | PUT | Log out of your account |
| /api/user | DELETE | Delete your account |

#### GET /api/users

Retrieve all active accounts on the application.

**Parameters** 

None

**Request Example** 

> curl -X GET "http://127.0.0.1:9000/api/users" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
        users: [
            {
                "id": 59,
                "username": "Somebody",
                "email": "Somebody@nobody.com",
                "dob": "1983-01-08T05:00:00.000Z",
                "online": false,
                "profile_picture": null,
                "display_name": "Actually Nobody",
                "hidden": false
 		    },
		    {
			    "id": 60,
        	    "username": "ExampleFriend1",
        	    "email": "FriendEmail1@example.com",
        	    "dob": "1999-03-20T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_2.jpg",
        	    "display_name": "John Smith" 
                "hidden": false
            },
            {
	            "id": 73,
        	    "username": "ExampleFriend2",
        	    "email": "FriendEmail2@example.com",
        	    "dob": "1975-07-17T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_3.jpg",
        	    "display_name": "Gerald Johnson" 
                "hidden": false
            }
        ];
    }
 
#### GET /api/user

Retrieves data for the user logged into the current session.

**Parameters** 

None

**Request Example**

> curl -X GET "http://127.0.0.1:9000/api/user " -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
        logged_user: {
            "id": 57,
            "username": "SampleUser",
            "email": "SampleUser@example.com",
            "dob": "2001-01-10T05:00:00.000Z",
            "online": true,
       	    "profile_picture": "image.jpg",
            "display_name": "Sample Sampleton" 
            "hidden": false
        }
    }

#### POST /api/signup

Allows the user to create an account for this application.

**Parameters** 

None

**Request Body Example** 

    {
	    username: SampleUser,
	    display_name: Sample Sampleton,
	    email: SampleUser@example.com 
        password: SamplePassword,
        confirm: SamplePassword
    }

**Request Error Example** 

> { email: Please enter a valid email address }

**Response** 

If the request is successful, then the user will receive a 303 HTTP status code and be redirected to the next page at /api/chats.

If the request is unsuccessful, then the user will receive a 400 HTTP status code along with an error in the response body.

#### POST /api/login

Logs the user into their account and assigns them a cookie for authorization.

**Parameters** 

None

**Request Body Example** 

    {
        user: SampleUser@example.com, 
        password: SamplePassword
    }

**Response**

If the request is successful, then the server will send a 303 HTTP status code and the user will be redirected to the next web page at endpoint /api/chats.

    + The built-in fetch API may not follow redirects automatically, so be sure that:

        + "Redirect" is set to "follow"

        + "Credentials" is set to "include" so that the token is sent to the server.

If the request is unsuccessful, then the server will send a 400 HTTP status code along with an error in the body.

**Request Error Example** 

> { user_err: This account does not exist }

**Response Example** 

    {
        chats: [
	        {
                "id": 101,
                "user2": {
                "id": 61,
                "display_name": "Chat Partner",
                "username": "Loves2Chat",
                "profile_picture": null
            },
            "last_message_sent": {
                "text": "Hello. How are you?",
                "sending_user": 57,
                "sent": "2025-06-21T06:26:55.495Z",
                "checked": false
            }
        },
        {
	        id: 106,
	        user2: {
	            "id": 73,
                "display_name": "Gerald Johnson" 
        	    "username": "ExampleFriend2"
       	        "profile_picture": "image_3.jpg"
            },
            last_message_sent: {
	            text: "No, I’ve never seen The Fifth Element.",
	            sending_user: "73",
	            sent: "2025–07-06T08:56:32.215Z"
            }
        }];
    }

#### PATCH /api/profile/picture

The user can set their profile picture by uploading an image.

**Parameters** 

None

**Request Body Example** 

    {
        fieldname: 'profile',
        originalname: 'image.jpg’',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        destination: '/example/images/destination',
        filename: 'profile-1751604888862',
        path: '/example/images/destination/image’,
        size: 40454
    }

#### PATCH /api/user/hidden/toggle

The user can decide whether or not to hide their online activity.

**Parameters** 

None

**Request Example** 

> curl -X PUT "http://127.0.0.1:9000/api/user/hidden/toggle" -H "Cookie: usertoken=your_token"

**Response**

Because this endpoint doesn’t require a request body, the user’s hidden status is automatically updated to true or false depending on its initial value. If the initial value is true, then the updated value will be false, and vice versa.


## Friends

Friends are users with whom you have active chats.

### Friends Methods

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/friends | GET | Retrieve a list of all of your friends |
| /api/unfriend/{username} | DELETE | Remove specified user from friendslist |


#### GET /api/friends

The user will receive an array containing every user in their friendslist.

**Parameters** 

None

**Request Example** 

> curl -X GET "http://127.0.0.1:9000/api/friends" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
        friends: [
	        {	
                "id": 60,
        	    "username": "ExampleFriend1",
        	    "email": "FriendEmail1@example.com",
        	    "dob": "1999-03-20T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_2.jpg",
        	    "display_name": "John Smith" ,
                "hidden": false
            },
            {
                "id": 73,
        	    "username": "ExampleFriend2",
        	    "email": "FriendEmail2@example.com",
        	    "dob": "1975-07-17T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_3.jpg",
        	    "display_name": "Gerald Johnson", 
                "hidden": false
            }
        ]
    }

#### DELETE /api/unfriend/<font color='green'>{username}</font>

The user can remove another user from their friendslist.

**Parameters** 

	username (path parameter): The username of the specified account. This parameter is always a string.

**Request Example** 

> curl -X DELETE "http://127.0.0.1:9000/api/unfriend/FriendExample1" -H "Cookie: usertoken=your_token"

**Response**

Because this endpoint does not require a request body, the specified user will be removed from the user’s friendslist automatically.

## Blocked

Blocked users are users you've chosen to hide from your profile.

### Blocked Methods

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/blocked | GET | Retrieve your blocked list |
| /api/block/{username} | POST | Add a user to your blocked list |
| /api/unblock/{username} | DELETE | Remove a user from your blocked list |

#### GET /api/blocked

The user will receive an array of users that they have blocked.

**Parameters** 

None

**Request Example** 

> curl -X GET "http://127.0.0.1:9000/api/blocked" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example**

    { 
        blocked_users: [
	        {
		        "id": 36,
        	    "username": "AMassiveJerk",
                "email": "JerkEmail1@example.com",
        	    "dob": "2007-02-02T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_4.jpg",
        	    "display_name": "Jerky McJerkface",
                "hidden": false
            },
            {
	            "id": 29,
        	    "username": "YetAnotherMeanie",
        	    "email": "JerkEmail2@example.com",
        	    "dob": "2004-09-12T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_5.jpg",
        	    "display_name": "Biff Tannen",
                "hidden": false
            }
        ]
    }

#### POST /api/block/<font color='green'>{username}</font>

The user can block or unblock the specified user.

**Parameters**

	username (path parameter): The username of the selected account. This parameter is always a string.

**Request Example** 

> curl -X POST "127.0.0.1:9000/api/block/AnotherBigMeanie" -H "Cookie: usertoken=your_token"

**Response**

Because this endpoint does not require a request body, the specified user will be blocked automatically.

#### DELETE /api/unblock/<font color='green'>{username}</font>

The user can remove another user from their blocked list.

**Parameters**

	username (path parameter): The username of the account to be unblocked.

**Request Example** 

> curl -X DELETE "http://localhost:127.0.0.1:9000/api/unblock/{username}" -H "Cookie: usertoken=your_user"

**Response**

Because this request does not require a body, the account will be removed from the user’s blocked list automatically.

## Chats

Chats are conversations where you can send and receive messages

### Chat Methods

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/chats | GET | View all your active chats |
| /api/{username}/chat | GET | Retrieve messages sent to and from the specified user |
| /api/{username}/message | PUT | Send a message and send a chat request if the chat is new |
| /api/chat/accept/{requestid} | POST | Accept chat request |
| /api/chat/reject/{requestid} | DELETE | Reject chat request | 
| /api/chat/{chatid} | DELETE | Delete the chat associated with the specified user |

#### GET /api/chats

The user retrieves an array of all of their active chats.

**Parameters** 

None

**Request Example** 

> curl -X GET "http://127.0.0.1:9000/api/chats" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
        chats: [
	        {
		        id: 101,
		        user2: {
                    "id": 60,
                    "display_name": "John Smith", 
                    "username": "ExampleFriend1",
                    "profile_picture": "image_2.jpg",
                    "online": true,
                    "hidden": false
                },
                last_message_sent: {
                    "text": "What would you like to talk about?",
                    "sending_user": 57,
                    "sent": "2025-07-04T06:26:55.495Z",
                    "checked": false
                }	
            },
            {
                id: 106,
                user2: {
                "id": 73,
                "display_name": "Gerald Johnson" 
                "username": "ExampleFriend2"
                "profile_picture": "image_3.jpg"
                },
                last_message_sent: {
                text: "No, I’ve never seen The Fifth Element.",
                sending_user: "73",
                sent: "2025–07-06T08:56:32.215Z"
                }
            }
        ]
    }

#### GET /api/<font color='green'>{username}</font>/chat

Retrieve all messages in the chat associated with the given username, as well as a chat request, if applicable.

**Parameters**

	username (path parameter): The username of the account associated with the chat. This is always a string.

**Request Example** 

> curl -X GET "127.0.0.1:9000/api/ExampleFriend2/chat" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
	    messages: [
            {
                "id": 154,
                "text": "Have you ever watched The Fifth Element? I hear it’s great.",
                "sending_user": 57,
                "receiving_user": 73,
                "sent": "2025-04-18T02:45:55.722Z",
                "checked": true,
                "image": null
        	},
        ],
        request: {
            id: 4,
            requesting_user: 57,
            requested_user: 73
        }
    }

#### POST /api/<font color='green'>{username}</font>/message

The user can send a message to the specific user, as well as a request if an associated chat does not exist.

**Parameters**

	username (path parameters): The username of the account to be messaged.

**Request Example** 

> curl -X POST "127.0.0.1:9000/api/ExampleFriend1/message" -F "chatimage=sample.jpg" -F "text=Look at this thing!" -H "Content-Type=multipart/form-data" -H "Cookie: usertoken=your_token"

**Response Example** 

    message: {
        "id": 186,
        "sending_user": 57,
        "receiving_user": 60,
        "text": "Look at this thing!",
        "sent": "2025-07-08T06:25:07.468Z",
        "checked": false,
        "image": "sample.jpg"
    }

#### POST /api/chat/accept/<font color='green'>{requestid}</font>

The user can accept or reject a chat request.

**Parameters**

	requestid (path parameter): The id of the request being handled. This is a string.

**Request Example**

> curl -X POST "http://127.0.0.1:9000/api/chat/accept/4" -H :Cookie usertoken=your_token"

**Response**

Because this endpoint doesn’t require a request body, the chat request will be deleted automatically, and the user will be able to chat with the user who messaged them.

#### DELETE /api/reject/<font color='green'>{requestid}</font>

The user can reject a chat request that was sent to them.

**Parameters**

	requestid (path parameter): The id of the request being handled. This is a string.

**Request Example**

> curl -X DELETE "http://127.0.0.1:9000/api/reject/4" -H "Cookie: usertoken=your_token" 

**Response**

Because this endpoint does not require a request body, both the chat request and the chat associated with the messaging user will be deleted.

#### DELETE /api/chat/<font color='green'>{chatid}</font>

The user may remove a chat from their queue.

**Parameters**

    chatid (path parameter): The id of the chat to be deleted. This is always a string.

**Request Example** 

> curl -X DELETE "127.0.0.1:9000/api/ExampleFriend2/chat" -H "Cookie: usertoken=your_token"

**Response**

Since this response does not require a request body, the chat is deleted automatically. 
    + The other user has their own chat, which means that they will still be able to message the deleting user.
        + Since messages are attached to users and not chats, when another chat is created, it will display previous messages from the deleted chat.

## Search

Search for users on the platform

### Search Methods

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/search?{query} | GET | Search for a user to start a chat with |


#### GET /api/search?<font color='red'>{query}</font>

The user may search for a user to begin a new chat.

**Parameters**

    query (query parameter): The user input that will be matched with an array of accounts associated with the application.

**Request Example** 

> curl -X GET "127.0.0.1:9000/api/search?q=Example" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 
    {
	    users: [
		    {
			    "id": 60,
        	    "username": "ExampleFriend1",
        	    "email": "FriendEmail1@example.com",
        	    "dob": "1999-03-20T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_2.jpg",
        	    "display_name": "John Smith" 
                "hidden": false
            },
            {
	            "id": 73,
        	    "username": "ExampleFriend2",
        	    "email": "FriendEmail2@example.com",
        	    "dob": "1975-07-17T05:00:00.000Z",
        	    "online": true,
       	        "profile_picture": "image_3.jpg",
        	    "display_name": "Gerald Johnson" 
                "hidden": false
            }
        ]
    }

# Have a Chat

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
| /api/users | GET | Get all available users |
| /api/user | GET | Retrieve your account information |
| /api/signup | POST | Create your own account |
| /api/login | POST | Log in to your existing account |
| /api/profile/picture | PATCH | Set or edit your profile picture |
| /api/user/hidden | PATCH | Toggle whether or not users can see when you're online |
| /api/user/logout | PATCH | Log out of your account |
| /api/user | DELETE | Delete your account |

#### GET /api/users

Retrieve all active accounts on the application.

**Parameters** 

None

**Request Example** 

> curl -X GET "http://api.haveachat.com/api/users" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
        users: [
            {
                "id": 1,
                "username": "Here2Chat",
                "dob": "1983-08-01",
                "online": false,
                "profile_picture": null,
                "display_name": "Adam Sutherland",
                "hidden": false
 		    },
		    {
			    "id": 2,
        	    "username": "ExampleFriend1",
        	    "dob": "1990-03-20",
        	    "online": true,
       	        "profile_picture": "https://examplestorage.com/examplestring1/image/upload/examplestring2/image.jpg",
        	    "display_name": "John Smith" 
                "hidden": true
            },
            {
	            "id": 3,
        	    "username": "SampleFriend2",
        	    "dob": "1975-07-17",
        	    "online": false,
       	        "profile_picture": "https://examplestorage.com/examplestring3/image/upload/examplestring4/image.jpg",
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

> curl -X GET "http://api.haveachat.com/api/user " -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response Example** 

    {
        logged_user: {
            "id": 4,
            "username": "ABoringUsername",
            "dob": "2001-01-10",
            "online": true,
       	    "profile_picture": "https://examplestorage.com/examplestring5/image/upload/examplestring6/image.jpg",
            "display_name": "Jonas Meyers" 
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
	    display: Sample Sampleton,
        dob: 1993-05-18,
	    email: SampleUser@example.com 
        password: SamplePassword,
        confirm: SamplePassword
    }

**Request Error Example** 

> { email: Please enter a valid email address }

**Response** 

If the request is successful, then the user will receive a 201 HTTP status code. Redirects must be handled in the server.

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
    
**Request Error Example** 

> { user_err: This account does not exist }

**Response**

If the request is successful, then the user will receive a 200 HTTP status code. Redirects must be handled in the client.

If the request is unsuccessful, then the server will send a 400 HTTP status code along with an error in the body.

#### PATCH /api/profile/picture

The user can set their profile picture by uploading an image.

**Parameters** 

None

**Request Example**

> curl -X PATCH "http://api.haveachat.com/api/user/picture" -H "Cookie: usertoken=your_token" -F "profilepicture=@/sample_destination/public/profilepics"

The file uploaded to profilepics must be an image.

There are no file size restrictions.

**Request Error Example**

> { image_error: Unable to upload image. }

**Response**

When uploading an image, the API will return a URL that can then be saved.

If the request is successful, then the user will receive a 200 HTTP status code and an object containing the updated image data.

If the user accessed this endpoint without submitting an image, then they will receive a 400 HTTP status code with an accompanying error.

**Response Example**

    updated_user: {
        profile_picture: https://examplestorage.com/examplestring5/image/upload/examplestring6/image.jpg
    }

#### PATCH /api/user/hidden

The user can decide whether or not to hide their online activity.

**Parameters** 

None

**Request Example** 

> curl -X PATCH "http://api.haveachat.com/api/user/hidden/toggle" -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 200 HTTP status code.

Because this endpoint doesn’t require a request body, the user’s hidden status is automatically updated to true or false depending on its initial value. If the initial value is true, then the updated value will be false, and vice versa.

**Response Example**

    hidden_status: {
        id: 4,
        hidden: true
    }


#### PATCH /api/logout

Logs the user out of the current session.

**Parameters**

None

**Request Example**

> curl -X PATCH http://api.haveachat.com/api/logout -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 200 HTTP status code, and their usertoken will be deleted.

This endpoint does not redirect elsewhere after a successful request. Redirects must be handled in the client.

#### DELETE /api/user

Users may delete their accounts.

**Parameters**

None

**Request Example**

> curl DELETE -X http://api.haveachat.com/api/user/delete -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 200 HTTP status code.

This endpoint does not redirect elsewhere after a successful request. Redirects must be handled in the client.

## Friends and Blocked Users

Friends are users with whom the user has active chats. Blocked users are users whose accounts have been hidden from the logged-in user.

### Friend and Blocked User Methods

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/unfriend/{username} | DELETE | Remove specified user from friendslist |
| /api/block/{username} | POST | Add a user to your blocked list |
| /api/unblock/{username} | DELETE | Remove a user from your blocked list |

#### DELETE /api/unfriend/{username}

The user can remove another user from their friendslist.

**Parameters** 

	username (path parameter): The username of the specified account. This parameter is always a string.

**Request Example** 

> curl -X DELETE "http://api.haveachat.com/api/unfriend/FriendExample1" -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 200 HTTP status code, and the user's friend object will be deleted.

The unfriended user's friend object will also be deleted.

#### POST /api/block/{username}

The user can block or unblock the specified user.

**Parameters**

	username (path parameter): The username of the selected account. This parameter is always a string.

**Request Example** 

> curl -X POST "http://api.haveachat.com/api/block/Here2Chat" -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 201 HTTP status code and an object containing the blocked user's data.

**Response Example**

    new_block: {
        blocked_user: 1,
        blocked_by: 4
    }

#### DELETE /api/unblock/{username}

The user can remove another user from their blocked list.

**Parameters**

	username (path parameter): The username of the account to be unblocked.

**Request Example** 

> curl -X DELETE "http://api.haveachat.com/api/unblock/Here2Chat" -H "Cookie: usertoken=your_user"

**Response**

Because this request does not require a body, the account will be removed from the user’s blocked list automatically.

## Chats

Chats are conversations where you can send and receive messages

### Chat Methods

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/chats | GET | View all your active chats |
| /api/chat/{username} | POST | Create a chat |
| /api/{username}/message | PUT | Send a message and send a chat request if the chat is new |
| /api/chat/accept/{requestid} | POST | Accept chat request |
| /api/chat/reject/{requestid} | DELETE | Reject chat request | 
| /api/chat/{chatid} | DELETE | Delete the chat associated with the specified user |

#### GET /api/chats

The user retrieves an array of all of their active chats, messages, and requests.

**Parameters** 

None

**Request Example** 

> curl -X GET "http://api.haveachat.com/api/chats" -H "Content-Type: application/json" -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 200 HTTP status code.

**Response Example** 

    {
        chats: [
	        {
                chat: {
                    id: 10,
                    user: {
                        "id": 2,
                        "username": "ExampleFriend1",
                        "display_name": "John Smith", 
                        "profile_picture": "https://examplestorage.com/examplestring1/image/upload/examplestring2/image.jpg",
                        "online": true,
                        "hidden": false
                    },
                    messages: [
                        {
                            "id": 20,
                            "text": "Would you like to know a fun little fact?"
                            "sending_user": 4,
                            "receiving_user": 2,
                            "sent": "2025-03-26",
                            "checked": true,
                            "image": null 
                        }
                        {
                            "id": 21,
                            "text": "Sure. Tell me a fun fact.",
                            "sending_user": 2,
                            "receiving_user": 4,
                            "sent": "2025-03-27",
                            "checked": true,
                            "image": null
                        },
                        {
                            "id": 22,
                            "text": "This guy holds the record for winning the most electoral votes without winning a presidential election."
                            "sending_user": 4,
                            "receiving_user": 2,
                            "sent": "2025-03-27",
                            "checked": false,
                            "image": https://examplestorage.com/examplestring11/image/upload/examplestring12/william_jennings_bryan.jpg
                        }
                    ]
                },
                request: null
            },
            {
                chat: {
                    id: 11,
                    user: {
                        "id": 3,
                        "username": "SampleFriend2",
                        "display_name": "Gerald Johnson", 
                        "profile_picture": "https://examplestorage.com/examplestring3/image/upload/examplestring4/image.jpg"
                        "online": true,
                        "hidden": false
                    },
                    messages: [
                        {
                            "id": 23,
                            "text": "Have you ever watched The Fifth Element? I hear it’s great.",
                            "sending_user": 4,
                            "receiving_user": 3,
                            "sent": "2025-04-18",
                            "checked": false,
                            "image": null
                        }
                    ]
                },
                request: {
                    id: 30,
                    requesting_user: 3
                }
            }
        ]
    }


#### POST /api/{username}/chat

The user can start a chat with another user.

**Parameters**

    username (path parameter): The username of the selected user.

**Request Example**

> curl -X POST http://api.haveachat.com/api/Here2Chat/chat -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 201 HTTP status code and an object containing the ids of the chat, the logged-in user, and the selected user.

**Response Example**

    chat: {
        id: 12,
        user1: 4,
        user2: 1
    }

#### POST /api/{username}/message

The user can send a message to the specific user, as well as a request if an associated chat does not exist.

**Parameters**

	username (path parameters): The username of the account to be messaged.

**Request Example** 

> curl -X POST "api.haveachat.com/api/ExampleFriend1/message" -F "chatimage=sample.jpg" -F "text=Look at this thing!" -H "Content-Type=multipart/form-data" -H "Cookie: usertoken=your_token"

**Response**

If the request was successful, then the user will receive a 201 HTTP status code with an object containing the sent message's data.

If the other user does not have an active chat with the logged-in user, then they will receive a request to chat in addition to the message.

**Response Example** 

    message: {
        "id": 24,
        "sending_user": 4,
        "receiving_user": 1,
        "text": "Here's a fun fact for you: William McKinley was the last president to wear a bowtie in his presidential portrait. Crazy, right?",
        "sent": "2025-03-30",
        "checked": false,
        "image": "https://examplestorage.com/examplestring14/image/upload/examplestring15/william_mckinley.jpg"
    }

#### POST /api/chat/accept/{requestid}

The user can accept or reject a chat request.

**Parameters**

	requestid (path parameter): The id of the request being handled.

**Request Example**

> curl -X POST "http://api.haveachat.com/api/chat/accept/4" -H :Cookie usertoken=your_token"

**Response**

The user will receive a 201 HTTP status code and an object containing both their id and the id of the user who sent the request. In addition, the chat request will be deleted.

When a request is accepted, both users will be considered friends. As such, the other user will have a friend object created for them as well.

**Response Example**

    {
        id: 40
        user1: 4,
        user2: 3
    }

#### DELETE /api/reject/{requestid}

The user can reject a chat request that was sent to them.

**Parameters**

	requestid (path parameter): The id of the request being handled.

**Request Example**

> curl -X DELETE "http://api.haveachat.com/api/reject/4" -H "Cookie: usertoken=your_token" 

**Response**

Because this endpoint does not require a request body, both the chat request and the chat associated with the messaging user will be deleted.

#### DELETE /api/chat/{chatid}

The user may remove a chat from their queue.

**Parameters**

    chatid (path parameter): The id of the chat to be deleted.

**Request Example** 

> curl -X DELETE "http://api.haveachat.com/api/ExampleFriend2/chat" -H "Cookie: usertoken=your_token"

**Response**

If the request is successful, then the user will receive a 200 HTTP status code.

If the other user has not deleted their copy of the chat, then all previous messages will be viewable if a new chat is created. If the other user's copy has been deleted, then all messages will be deleted as well.
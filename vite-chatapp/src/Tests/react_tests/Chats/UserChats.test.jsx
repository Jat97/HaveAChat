import {renderHook, render, screen, waitFor} from '@testing-library/react';
import {client, user, wrapper} from '../testItems';
import {act, beforeEach, describe, expect, test, vi} from 'vitest';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, MemoryRouter, Routes, Route} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchLogged} from '../../../Routes/Functions/Fetch/FetchLogged';
import {useFetchChats} from '../../../Routes/Functions/Fetch/FetchChats';
import {useFetchMessages} from '../../../Routes/Functions/Fetch/FetchMessages';
import Chats from '../../../Routes/Chats/Chats';
expect.extend(matchers);

test('Send a message', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const logData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(logData.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));
    
    const setSelectedChat = mockStore.result.current.setSelectedChat; 
    
    setSelectedChat(chatData.result.current.data.chats[1].user2);
    
    await waitFor(() => {
        expect(mockStore.result.current.selected_chat).not.toBeNull();
    });

    const selected_chat = mockStore.result.current.selected_chat;

    const messageData = renderHook(() => 
        useFetchMessages([selected_chat.username, mockStore.result.current.setSiteError]), 
        {wrapper}
    );
    
    await waitFor(() => expect(messageData.result.current.isSuccess).toBe(true));

    render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const message_input = screen.getByTestId('message_input');
    const image_input = screen.getByTestId('image_input');
    expect(image_input).toBeInTheDocument();

    const file = new File(['snake'], 'snake.jpg', {type: 'image/jpg'});
    await user.upload(image_input, file);
    await user.type(message_input, 'Look at this cool snake that I found in my yard.');
    
    expect(image_input.files).toHaveLength(1);

    const send_message = vi.fn(() => {
        const chat_messages = [...messageData.result.current.data.messages];

        const new_message = {
            sending_user: chat_messages[0].sending_user.id,
            receiving_user: chat_messages[0].receiving_user.id,
            text: message_input.value,
            image: image_input.value,
            sent: new Date(Date.now()),
            checked: false
        }

        return messageData.result.current.data.messages.push(new_message);
    });

    const send_button = screen.getByTestId('message_button');
    send_button.onclick = send_message;
    send_button.click();

    expect(send_message).toHaveBeenCalledTimes(1);
    expect(messageData.result.current.data.messages.length).toBe(4);
});
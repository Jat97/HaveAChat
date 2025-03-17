import {renderHook, render, screen, waitFor} from '@testing-library/react';
import {client, user, wrapper} from '../testItems';
import {expect, test, vi} from 'vitest';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, MemoryRouter, Routes, Route} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchLogged} from '../../../Routes/Functions/FetchLogged';
import {useFetchChats} from '../../../Routes/Functions/FetchChats';
import {useFetchMessages} from '../../../Routes/Functions/FetchMessages';
import UserChat from '../../../Routes/Chats/UserChat';
expect.extend(matchers);

test('Send a message', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const logData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(logData.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));
    
    const selected_chat = chatData.result.current.data.chats[0];
    
    const messageData = renderHook(() => 
        useFetchMessages([selected_chat.user2.username, mockStore.result.current.setSiteError]), 
        {wrapper}
    );
    
    await waitFor(() => expect(messageData.result.current.isSuccess).toBe(true));

    const chat_messages = messageData.result.current.data.messages
        .filter(message => message.receiving_user.id === selected_chat.user2.id);

    render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[`/api/${selected_chat.user2.username}/chat`]}>
                <Routes>
                    <Route path='/api/:username/chat' element={<UserChat />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )

    const message_input = screen.getByRole('textbox');
    const image_input = screen.getByLabelText('');
    expect(image_input).toBeInTheDocument();

    const file = new File(['snake'], 'snake.jpg', {type: 'image/jpg'});
    await user.upload(image_input, file);
    await user.type(message_input, 'Look at this cool snake that I found in my yard.');
    
    expect(image_input.files).toHaveLength(1);

    const send_message = vi.fn(() => {
        const new_message = {
            sending_user: chat_messages[0].sending_user.id,
            receiving_user: chat_messages[0].receiving_user.id,
            text: message_input.value,
            image: image_input.value,
            sent: new Date(Date.now()),
            checked: false
        }

        return chat_messages.push(new_message);
    });

    const send_button = screen.getByRole('button');
    send_button.onclick = send_message;
    send_button.click();

    expect(send_message).toHaveBeenCalledTimes(1);
    expect(chat_messages.length).toBe(2);
});
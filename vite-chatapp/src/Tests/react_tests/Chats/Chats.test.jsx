import {renderHook, act, render, screen, waitFor} from '@testing-library/react';
import {expect, test, vi} from 'vitest';
import {client, user, wrapper} from '../testItems';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchChats} from '../../../Routes/Functions/FetchChats';
import Chats from '../../../Routes/Chats/Chats';
expect.extend(matchers);

test('Delete chat', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));

    render (
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const delete_chat = vi.fn(() => {
        return act(() => {
            chatData.result.current.data.chats.splice(1, 1);
        });
    });

    const delete_chat_button = screen.getByTestId(chatData.result.current.data.chats[1].id);
    delete_chat_button.onclick = delete_chat;
    delete_chat_button.click();

    expect(delete_chat).toHaveBeenCalledTimes(1);
    expect(chatData.result.current.data.chats.length).toBe(1);
});
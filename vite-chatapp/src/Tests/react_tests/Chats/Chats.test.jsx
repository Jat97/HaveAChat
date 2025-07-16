import {renderHook, act, render, screen, waitFor} from '@testing-library/react';
import {expect, test, vi} from 'vitest';
import {client, user, wrapper} from '../testItems';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchChats} from '../../../Routes/Functions/Fetch/FetchChats';
import {useFetchBlocked} from '../../../Routes/Functions/Fetch/FetchBlocked';
import {useFetchUsers} from '../../../Routes/Functions/Fetch/FetchUsers';
import Chats from '../../../Routes/Chats/Chats';
import SearchTab from '../../../Routes/Inputs/Search/SearchTab';
expect.extend(matchers);

test('Search for a user', async () => { 
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));

    const {unmount} = render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const search = screen.getByTestId('user_search');
    await user.type(search, 'Jude'); 
    const search_value = document.querySelector('#user_search').value;
    
    unmount();
    
    const userData = renderHook(() => useFetchUsers(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(userData.result.current.isSuccess).toBe(true));

    const search_results = userData.result.current.data.users.filter(user => user.display_name === search_value);

    render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <SearchTab props={search_results} />
            </BrowserRouter>
        </QueryClientProvider>
    )   
        
    const searched_user = await screen.findByText(userData.result.current.data.users[0].display_name);  
    expect(searched_user).toBeInTheDocument();   
});

test('Delete chat', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper});
    const blockData = renderHook(() => useFetchBlocked(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(blockData.result.current.isSuccess).toBe(true));

    render (
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const ellipses = screen.getByTestId(`ellipses-${chatData.result.current.data.chats[1].id}`);
    await user.click(ellipses);

    const delete_chat = vi.fn(() => {
        return act(() => {
            chatData.result.current.data.chats.splice(1, 1);
        });
    });

    await waitFor(() => {
        const delete_chat_button = screen.getByTestId(`delete-${chatData.result.current.data.chats[1].id}`);
        delete_chat_button.onclick = delete_chat;
        delete_chat_button.click();
    });

    expect(delete_chat).toHaveBeenCalledTimes(1);
    expect(chatData.result.current.data.chats.length).toBe(2);
});
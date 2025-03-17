import {renderHook, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, test, vi} from 'vitest';
import {client, user, wrapper} from '../testItems';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, MemoryRouter, Routes, Route} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchBlocked} from '../../../Routes/Functions/FetchBlocked';
import {useFetchFriends} from '../../../Routes/Functions/FetchFriends';
import {useFetchUsers} from '../../../Routes/Functions/FetchUsers';
import {useFetchLogged} from '../../../Routes/Functions/FetchLogged';
import UserIndex from '../../../Routes/Users/UserIndex';
import Chats from '../../../Routes/Chats/Chats';
expect.extend(matchers);

test('View user index', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});

    const userData = renderHook(() => useFetchUsers(null, mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(userData.result.current.isSuccess).toBe(true));

    render (
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/api/index']}>
                <Routes>
                    <Route path='/api/index' element={<UserIndex />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>    
    )
    
    userData.result.current.data.users.slice(1, 2).forEach(user => {
        const account = screen.getByText(user.username);
        expect(account).toBeInTheDocument();
    });

    expect(userData.result.current.data.users.length - 1).toBe(2);
});

test('View friends', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});

    const logData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    const friendData = renderHook(() => useFetchFriends(undefined), {wrapper});
    await waitFor(() => expect(logData.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(friendData.result.current.isSuccess).toBe(true));
    expect(friendData.result.current.data.friends.length).toBe(2);

    render (
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/api/friends']}>
                <Routes>
                    <Route path='/api/friends' element={<UserIndex />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )

    for(const friend of friendData.result.current.data.friends) {
        await waitFor(() => {
            const user = screen.getByText(friend.user2.display_name);
            expect(user).toBeInTheDocument();
        });
    }

    const friend_button = screen.getByTestId(friendData.result.current.data.friends[0].user2.username);
    expect(friend_button).toBeInTheDocument();

    const remove_friend = vi.fn((e) => { 
        return friendData.result.current.data.friends.forEach((friend, index) => {
            if(friend.user2.username === e.target.id) {
                friendData.result.current.data.friends.splice(index, 1);  
            }
        });
    });

    friend_button.onclick = remove_friend;

    friend_button.click();

    expect(remove_friend).toBeCalledTimes(1);
    expect(friendData.result.current.data.friends.length).toBe(1);
});

test('View blocked user, then unblock them', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});

    const logData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    const blockData = renderHook(() => useFetchBlocked(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(logData.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(blockData.result.current.isSuccess).toBe(true));

    render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/api/blocked']}>
                <Routes>
                    <Route path='/api/blocked' element={<UserIndex />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )

    expect(blockData.result.current.data.blocked_users.length).toBe(1);
    const blocked_user = screen.getByText(blockData.result.current.data.blocked_users[0].blocked_user.display_name);
    expect(blocked_user).toBeInTheDocument();

    const block_button = screen.getByTestId(blockData.result.current.data.blocked_users[0].blocked_user.username);
    expect(block_button).toBeInTheDocument();
    
    const unblock = vi.fn(() => {
        return blockData.result.current.data.blocked_users.splice(0, 1);
    });

    block_button.onclick = unblock;
    block_button.click();

    expect(unblock).toHaveBeenCalledTimes(1);
    expect(blockData.result.current.data.blocked_users.length).toBe(0);
});

test('Search for a user', async () => { 
    const {unmount} = render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const search = screen.getByRole('searchbox');
    await user.type(search, 'Jude');
    const search_button = screen.getByTestId('search');

    const form = search_button.closest('form');
    fireEvent.submit(form); 

    unmount();

    const mockStore = renderHook(() => useChatStore(), {wrapper});

    const userData = renderHook(() => useFetchUsers('?query=Jude', mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(userData.result.current.isSuccess).toBe(true));
    expect(userData.result.current.data.users.length).toBeGreaterThan(0);

    render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/api/search?query=Jude']}>
                <Routes>
                    <Route path='/api/search' element={<UserIndex />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )    
        
    const searched_user = await screen.findByText(userData.result.current.data.users[0].display_name);  
    expect(searched_user).toBeInTheDocument();   
});
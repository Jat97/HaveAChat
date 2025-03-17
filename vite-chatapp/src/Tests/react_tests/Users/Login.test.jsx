import {renderHook, render, screen, waitFor} from '@testing-library/react';
import {client, user, wrapper} from '../testItems'; 
import {expect, test, vi} from 'vitest';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, MemoryRouter, Routes, Route} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchChats} from '../../../Routes/Functions/FetchChats';
import Login from '../../../Routes/Users/Profile/Login';
import Chats from '../../../Routes/Chats/Chats';
expect.extend(matchers);

test('Log in, then show chats', async () => {
    const {unmount} = render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/api/login']}>
                <Routes>
                    <Route path='/api/login' element={<Login />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );

    await user.type(screen.getByTestId('user'), 'Jat97');
    await user.type(screen.getByTestId('password'), 'ascmKDKMDSLK02I9379JFKA');

    const button = screen.getByRole('button', {name: 'Log in'});
    await user.click(button);

    unmount();

    const mockStore = renderHook(() => useChatStore(undefined), {wrapper});
    
    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteStore), {wrapper}); 
    
    render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    ); 

    await waitFor(() => {
        expect(chatData.result.current.isSuccess).toBe(true);
    });

    expect(chatData.result.current.data.chats.length).toBe(2);
    
    chatData.result.current.data.chats.forEach(chat => {
        const user = screen.getByText(chat.user2.display_name);
        expect(user).toBeInTheDocument();
    });     
});
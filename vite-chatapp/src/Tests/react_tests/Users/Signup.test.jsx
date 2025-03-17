import {renderHook, render, screen, waitFor} from '@testing-library/react';
import {client, user, wrapper} from '../testItems'; 
import {expect, test, vi} from 'vitest';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, MemoryRouter, Routes, Route} from 'react-router-dom';
import Signup from '../../../Routes/Users/Profile/Signup';
import Chats from '../../../Routes/Chats/Chats';
import {useChatStore} from '../../../Context/ChatStore';
import { useFetchChats } from '../../../Routes/Functions/FetchChats';
expect.extend(matchers);

test('Create account, show empty chats', async () => {
    const {unmount} = render (
         <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/api/signup']}>
                <Routes>
                    <Route path='/api/signup' element={<Signup />}></Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
    
    console.log(window.location.href, 'JDSKJSDLKJDFLKJ09908')
       
    await user.type(screen.getByTestId('username'), 'TestUser');
    await user.type(screen.getByTestId('name'), 'Test User');
    await user.type(screen.getByTestId('email'), 'Usermail@testing.com');
    await user.type(screen.getByTestId('dob'), '06/30/1996');
    await user.type(screen.getByTestId('password'), 'Testingpassword');
    await user.type(screen.getByTestId('confirm'), 'Testingpassword');

    const signin = screen.getByRole('button', {name: 'Sign up'});
    await user.click(signin);

    unmount();

    const mockStore = renderHook(() => useChatStore());

    const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper})
    await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));

    render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Chats />
            </BrowserRouter>
        </QueryClientProvider>
    )

    expect(chatData.result.current.data.chats).toHaveLength(0);
});
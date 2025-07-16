import {renderHook, render, screen, waitFor} from '@testing-library/react';
import {client, user, wrapper} from '../testItems';
import {expect, test, vi} from 'vitest';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchLogged} from '../../../Routes/Functions/Fetch/FetchLogged';
import AccountTab from '../../../Routes/Users/Profile/AccountTab';
import Chats from '../../../Routes/Chats/Chats';
import {useFetchChats} from '../../../Routes/Functions/Fetch/FetchChats';
expect.extend(matchers);

test('Edit profile picture', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const logData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(logData.result.current.isSuccess).toBe(true));

    render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <AccountTab />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const file_uploader = screen.getByLabelText('');
    expect(file_uploader).toBeInTheDocument();

    const file = new File(['image'], 'image.jpg', {type: 'image/jpg'});
    await user.upload(file_uploader, file)

    expect(file_uploader.files).toHaveLength(1);
});

describe('Access tab, toggle hidden status, delete account', () => {
    test('Access tab from chat, then toggle hidden status', async () => {
        const mockStore = renderHook(() => useChatStore(), {wrapper});
        const loggedData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
        const chatData = renderHook(() => useFetchChats(mockStore.result.current.setSiteError), {wrapper});

        await waitFor(() => expect(loggedData.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(chatData.result.current.isSuccess).toBe(true));

        render (
            <QueryClientProvider client={client}>
                <BrowserRouter>
                    <Chats />
                </BrowserRouter>
            </QueryClientProvider> 
        )

        const account_button = screen.getByTestId('account_button');

        await user.click(account_button);

        await waitFor(() => {
            const status_button = screen.getByTestId('hide_status');
            expect(status_button).toBeInTheDocument();
            status_button.onclick = vi.fn(() => {
                loggedData.result.current.data.logged_user.hidden = true;
            });

            status_button.click();
        });

        expect(loggedData.result.current.data.logged_user.hidden).toBe(true);
    });

    test('Delete account', async () => {
        const mockStore = renderHook(() => useChatStore(), {wrapper});
        let loggedData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
        await waitFor(() => expect(loggedData.result.current.isSuccess).toBe(true));

        render (
            <QueryClientProvider client={client}>
                <BrowserRouter>
                    <AccountTab />
                </BrowserRouter>
            </QueryClientProvider>
        )

        const delete_account = vi.fn(() => {
            return loggedData = null;
        });

        const delete_button = screen.getByRole('button', {name: 'Delete account'});
        delete_button.onclick = delete_account;
        delete_button.click();

        expect(delete_account).toHaveBeenCalledTimes(1);
        expect(loggedData).toBe(null);
    });
});
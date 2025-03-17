import {renderHook, render, screen, waitFor} from '@testing-library/react';
import {client, user, wrapper} from '../testItems';
import {expect, test, vi} from 'vitest';
import * as matchers from '@testing-library/jest-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {useChatStore} from '../../../Context/ChatStore';
import {useFetchLogged} from '../../../Routes/Functions/FetchLogged';
import Account from '../../../Routes/Users/Profile/Account';
expect.extend(matchers);

test('Edit profile picture', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    const logData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(logData.result.current.isSuccess).toBe(true));

    render(
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Account />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const file_uploader = screen.getByLabelText('');
    expect(file_uploader).toBeInTheDocument();

    const file = new File(['image'], 'image.jpg', {type: 'image/jpg'});
    await user.upload(file_uploader, file)

    expect(file_uploader.files).toHaveLength(1);
});

test('Delete account', async () => {
    const mockStore = renderHook(() => useChatStore(), {wrapper});
    let loggedData = renderHook(() => useFetchLogged(mockStore.result.current.setSiteError), {wrapper});
    await waitFor(() => expect(loggedData.result.current.isSuccess).toBe(true));

    render (
        <QueryClientProvider client={client}>
            <BrowserRouter>
                <Account />
            </BrowserRouter>
        </QueryClientProvider>
    )

    const delete_account = vi.fn(() => {
        return loggedData = null;
    });

    const delete_button = screen.getByRole('button', {name: 'Delete'});
    delete_button.onclick = delete_account;
    delete_button.click();

    expect(delete_account).toHaveBeenCalledTimes(1);
    expect(loggedData).toBe(null);
});
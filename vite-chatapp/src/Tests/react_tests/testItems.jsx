import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

export const client = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 0,
            retry: false,
        }
    }
});

export const wrapper = ({children}) => {
    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>   
    )
};

export const user = userEvent.setup();
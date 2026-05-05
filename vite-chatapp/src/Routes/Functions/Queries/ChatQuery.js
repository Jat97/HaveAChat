import {useQuery} from '@tanstack/react-query';

export const useFetchChats = ([unauthorized, setUnauthorized, setSiteError]) => {
    const result = useQuery({
        queryKey: ['chats'], 
        queryFn: async () => {
            return await fetch('http://127.0.0.1:9000/api/chats', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => { 
                if(res.status === 401) {
                    setAuthorized(false);
                } 
                else if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    if(!authorized) {
                        setAuthorized(true);
                    }

                    return res.json();
                }
            })
            .then(json => {
                if(json.error.error) {
                    setSiteError(json.error.error);
                }
            })
            .catch(err => setSiteError(err.message))
        },
        queryOptions: {
            retry: false,
            staleTime: 1000 * 60,
            refetchInterval: 10000
        }
    });

    return result;
}
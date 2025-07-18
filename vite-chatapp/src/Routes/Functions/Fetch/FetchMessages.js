import {useQuery} from '@tanstack/react-query';

export const useFetchMessages = ([username, unauthorized, setUnauthorized, setSiteError]) => {
    const result = useQuery({
        queryKey: ['messages', username],
        queryFn: async () => {
            return await fetch(`http://localhost:9000/api/${username}/chat`, {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => {
                if(res.status === 401) {
                    setUnauthorized(true);
                }  
                else if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    if(unauthorized) {
                        setUnauthorized(false);
                    }

                    return res.json();
                }
            })
            .catch(err => setSiteError(err.message))
        },
        queryOptions: {
            enabled: !!username
        }
    });

    return result;
}
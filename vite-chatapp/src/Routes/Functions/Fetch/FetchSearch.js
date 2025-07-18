import {useQuery} from '@tanstack/react-query';

export const useFetchSearch = ([query, unauthorized, setUnauthorized, setSiteError]) => {
    const result = useQuery({
        queryKey: ['search'],
        queryFn: async () => {
            return await fetch(`http://localhost:9000/api/search/${query}`, {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => {
                if(res.status === 401) {
                    setUnauthorized(true);
                }
                else if(res.ok === false) {
                    throw Error(`${res,status}: ${res.statusText}`);
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
            retry: false,
            staleTime: 1000 * 60,
            refetchInterval: 10000 
        }
    });

    return result;
}
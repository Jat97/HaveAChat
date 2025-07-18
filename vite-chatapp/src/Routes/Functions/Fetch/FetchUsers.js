import {useQuery} from '@tanstack/react-query';

export const useFetchUsers = ([unauthorized, setUnauthorized, setSiteError]) => {
    const result = useQuery({
        queryKey: ['users'], 
        queryFn: async () => {
            return await fetch('http://127.0.0.1:9000/api/users', {
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
        }
    });

    return result;
}
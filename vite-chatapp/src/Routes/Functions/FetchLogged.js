import {useQuery} from '@tanstack/react-query';

export const useFetchLogged = (setSiteError) => {
    const result = useQuery({
        queryKey: ['logged'], 
        queryFn: async () => {
            return await fetch('http://localhost:9000/api/user', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => {
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .catch(err => setSiteError(err.message))
    }});

    return result;
}
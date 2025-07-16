import {useQuery} from '@tanstack/react-query';

export const useFetchFriends = (setSiteError) => {
    const result = useQuery({
        queryKey: ['friends'], 
        queryFn: async () => {
            return await fetch('http://localhost:9000/api/friends', {
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
            .catch(err => {console.log(err), setSiteError(err.message)})
        },
        retry: false,
        staleTime: 1000 * 60,
        refetchInterval: 10000
    });

    return result;
};
import {useQuery} from '@tanstack/react-query';

export const useFetchChats = (setSiteError) => {
    const result = useQuery({
        queryKey: ['chats'], 
        queryFn: async () => {
            return await fetch('http://localhost:9000/api/chats', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => { 
                console.log(res)
                if(res.ok === false) {
                    throw Error(`${res.status}: ${res.statusText}`);
                }
                else {
                    return res.json();
                }
            })
            .catch(err => setSiteError(err.message))
        }
    });

    return result;
}
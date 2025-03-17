import {MagnifyingGlassIcon} from '@heroicons/react/24/solid';

const Search = () => {
    return (
        <div>
            <input type='search' name='query' placeholder='Search for a user...'></input>

            <div>
                <MagnifyingGlassIcon />
            </div>
        </div>
    )
}

export default Search;
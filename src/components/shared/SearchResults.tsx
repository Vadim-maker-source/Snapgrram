import { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";

type SearchResultsProps = {
    isSearchFetching: boolean;
    searchedPosts: Models.Document[];
}

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultsProps) => {
    if(isSearchFetching) return <Loader />

    if (searchedPosts?.[0]?.documents?.length > 0) {
      <GridPostList posts={searchedPosts[0].documents || []} />
  }
    
  return (
    <p className="text-light-4 mt-10 text-center w-full">Ничего не найдено</p>
  )
}

export default SearchResults
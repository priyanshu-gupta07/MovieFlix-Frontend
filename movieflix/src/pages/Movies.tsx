import { useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetFilteredMoviesQuery } from "../redux/services/movies";
import { useGetAllGenresQuery } from "../redux/services/genre";

import Spinner from "../Design/Spinner";
import MovieItem from "../components/Movies/MovieItem";

const MoviesPage = () => {
  const [showFiltered, setShowFiltered] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const currentPage = Number(queryParams.get("page")) || 1;
  const limit = Number(queryParams.get("limit")) || 10;

  const [filteredState, setFilteredState] = useState({
    limit,
    order_by: queryParams.get("order_by") || "",
    genre: queryParams.get("genre") || "",
    year: queryParams.get("year") || "",
  });

  const {
    isLoading,
    isSuccess,
    isError,
    data: featureMovies,
    error,
  } = useGetFilteredMoviesQuery(
    `movies?limit=${limit}&page=${currentPage}${
      queryParams.has("s") ? `&s=${queryParams.get("s")}` : ""
    }${queryParams.has("genre") ? `&genre=${queryParams.get("genre")}` : ""}${
      queryParams.has("year") ? `&year=${queryParams.get("year")}` : ""
    }${
      queryParams.has("order_by")
        ? `&order_by=${queryParams.get("order_by")}`
        : ""
    }`
  );

  const {
    isLoading: genresLoading,
    isSuccess: genresSuccess,
    data: genres,
  } = useGetAllGenresQuery();

  const handlePageChange = useCallback(
    (newPage: number | null) => {
      if (typeof newPage === "number") {
        // Update the URL with the new page number
        queryParams.set("page", newPage.toString());
        navigate(`?${queryParams.toString()}`);
      }
    },
    [queryParams, navigate]
  );

  const handleFilterChange = useCallback(
    (filterName: string, value: string | number) => {
      setFilteredState((prevState) => ({
        ...prevState,
        [filterName]: value,
      }));
    },
    []
  );

  const handleSubmitFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    // Clone the existing query parameters
    const newQueryParams = new URLSearchParams(queryParams);
  
    // Update the cloned query parameters with the new filter values
    newQueryParams.set("limit", filteredState.limit.toString());
  
    if (filteredState.order_by) {
      newQueryParams.set("order_by", filteredState.order_by);
    } else {
      newQueryParams.delete("order_by"); // Remove the parameter if empty
    }
  
    if (filteredState.genre) {
      newQueryParams.set("genre", filteredState.genre);
    } else {
      newQueryParams.delete("genre"); // Remove the parameter if empty
    }
  
    if (filteredState.year) {
      newQueryParams.set("year", filteredState.year.toString());
    } else {
      newQueryParams.delete("year"); // Remove the parameter if empty
    }
  
    // Update the URL with the new query parameters
    navigate(`?${newQueryParams.toString()}`);
    setShowFiltered(false)
  };
  

  const memoizedContent = useMemo(() => {
    if (isLoading) {
      return <Spinner />;
    } else if (isError) {
      let errorMessage;
      const err = error as any;
  
      if ("data" in err && err.data) {
        errorMessage = err.data.err.message;
      } else {
        errorMessage = "An unknown error occurred. Please try again.";
      }
  
      return <p className="text-red-500 text-lg bg-black/50 p-4 rounded-lg">{errorMessage}</p>;
    } else if (isSuccess && featureMovies.movies) {
      const { total_count, per_page, current_page, movies } = featureMovies;
      const pages = Math.ceil(total_count / per_page);
      const prevPage = current_page > 1 ? current_page - 1 : null;
      const nextPage = current_page < pages;
  
      return (
        <>
          <ul className="flex flex-row justify-center list-none flex-wrap mt-4 gap-4">
            {movies.map((item) => {
              return <MovieItem key={item.id} item={item} />;
            })}
          </ul>
          <div className="flex justify-center my-6 items-center">
            <button
              onClick={() => handlePageChange(prevPage)}
              disabled={!prevPage}
              className="mr-2 bg-black hover:bg-red-700 px-4 py-2 rounded text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Previous
            </button>
            <p className="mx-4 text-sm">
              <span className="text-red-400">{current_page}</span> <span className="text-gray-400">of</span> <span className="text-red-400">{pages}</span>
            </p>
            <button
              onClick={() => handlePageChange(current_page + 1)}
              disabled={!nextPage}
              className="ml-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Next
            </button>
          </div>
        </>
      );
    }
  
    return (
      <p className="text-red-500 text-lg bg-black/30 text-center w-fit mx-auto px-6 py-3 rounded-lg">
        No Movies Found!
      </p>
    );
  }, [isLoading, isError, error, isSuccess, featureMovies]);
  
  const memorizeGenresOptions = useMemo(() => {
    if (genresLoading) {
      return <option value="">Loading...</option>;
    } else if (genresSuccess && genres.genres) {
      return genres.genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {genre.genre_name}
        </option>
      ));
    }
    return <option value="">Failed to load the genres</option>;
  }, [genresLoading, genresSuccess, genres]);
  
  const memoizedBtnClasses = useMemo(
    () =>
      showFiltered
        ? "rounded-lg border px-4 py-2 text-sm border-red-500 text-red-500 hover:bg-red-900/30 transition-colors duration-300"
        : "rounded-lg border px-4 py-2 text-sm border-red-500 text-red-500 hover:bg-red-900/30 transition-colors duration-300",
    [showFiltered]
  );
  
  return (
    <section className="min-h-[250px] bg-black px-6 py-8 rounded-xl shadow-lg">
      <h2 className="text-center text-2xl py-4 font-bold border-b-2 border-red-500 flex justify-between items-center">
        <span className="text-red-400">Movies</span>
        <button
          type="button"
          className={memoizedBtnClasses}
          onClick={() => {
            setShowFiltered((prev) => !prev);
          }}
        >
          Filters
        </button>
      </h2>
      {showFiltered && (
        <form
          onSubmit={(e) => handleSubmitFilter(e)}
          className="bg-black/30 mb-6 p-6 rounded-lg mt-4"
        >
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex flex-col justify-center items-start gap-2 flex-grow flex-shrink min-w-[180px] max-w-[400px]">
              <label htmlFor="limit" className="text-red-400">Limit</label>
              <select
                value={filteredState.limit}
                name="limit"
                id="limit"
                className="bg-gray-800 w-full p-2 text-gray-200 rounded border border-red-500 focus:border-red-400 focus:ring focus:ring-red-400 focus:ring-opacity-50"
                onChange={(e) => handleFilterChange("limit", e.target.value)}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex flex-col justify-center items-start gap-2 flex-grow flex-shrink min-w-[180px] max-w-[400px]">
              <label htmlFor="order_by" className="text-red-400">Order By</label>
              <select
                value={filteredState.order_by}
                name="order_by"
                id="order_by"
                className="bg-gray-800 w-full p-2 text-gray-200 rounded border border-red-500 focus:border-red-400 focus:ring focus:ring-red-400 focus:ring-opacity-50"
                onChange={(e) => handleFilterChange("order_by", e.target.value)}
              >
                <option value="rating">Rating</option>
                <option value="runtime">Runtime</option>
                <option value="old">Oldest</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="flex flex-col justify-center items-start gap-2 flex-grow flex-shrink min-w-[180px] max-w-[400px]">
              <label htmlFor="genre" className="text-red-400">Genre</label>
              <select
                value={filteredState.genre}
                name="genre"
                id="genre"
                className="bg-gray-800 w-full p-2 text-gray-200 rounded border border-red-500 focus:border-red-400 focus:ring focus:ring-red-400 focus:ring-opacity-50"
                onChange={(e) => handleFilterChange("genre", e.target.value)}
              >
                {memorizeGenresOptions}
              </select>
            </div>
            <div className="flex flex-col justify-center items-start gap-2 flex-grow flex-shrink min-w-[180px] max-w-[400px]">
              <label htmlFor="year" className="text-red-400">Year</label>
              <input
                type="number"
                name="year"
                id="year"
                value={filteredState.year}
                className="bg-gray-800 w-full p-2 text-gray-200 rounded border border-red-500 focus:border-red-400 focus:ring focus:ring-red-400 focus:ring-opacity-50 placeholder:text-gray-500"
                onChange={(e) => handleFilterChange("year", e.target.value)}
                placeholder="Year"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 block w-fit ms-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors duration-300"
          >
            Apply Filter
          </button>
        </form>
      )}
  
      {memoizedContent}
    </section>
  );
}

export default MoviesPage;

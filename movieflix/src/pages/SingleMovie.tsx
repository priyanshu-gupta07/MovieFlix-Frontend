import { useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks/typeHooks";
import { useGetSingleMovieQuery, useManageFavoriteMutation } from "../redux/services/movies";
import {logoutAction} from '../redux/features/authSlice'

import Spinner from "../Design/Spinner";
import Button from "../Design/Button";
import AddCommentForm from "../components/Movies/AddCommentForm";
import { formatDateDefault } from "../utils/utils";
import Modal from "../Design/Modal";
import AddRating from "../components/Movies/AddRating";
import DeleteMovie from "../components/Movies/DeleteMovie";

const SingleMoviePage = () => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [manageFavorite, {isLoading: isFavLoading}] = useManageFavoriteMutation()
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const user = useAppSelector((state) => state.auth.user);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const {
    isLoading,
    isError,
    isSuccess,
    data: movieResponse,
    error,
  } = useGetSingleMovieQuery(Number(id));

  const showDeleteModelHandler = () => {
    setShowDeleteModal(true)
  }

  const hideDeleteModelHandler = () => {
    setShowDeleteModal(false)
  }

  const hideRatingModalHandler = () => {
    setShowRatingModal(false);
  };

  const showRatingModalHandler = () => {
    if (!user || !user.id) {
      navigate(`/auth?callback=${pathname}${search}`);
      return;
    }
    setShowRatingModal(true);
  };

  const editMovieHandler = (id: number) => {
    console.log(id);
  };

  const handleAddFavorite = async (id: number) => {
    if (!user) {
      navigate(`/auth?callback=${pathname}${search}`);
      return;
    }

    try {
      await manageFavorite(id).unwrap()
    } catch (error) {
      const err = error as CustomErrorType
      let errMsg = 'something went wrong. please try again!'
      if(err.status && err.status === 401) {
        dispatch(logoutAction())
      }

      if(err.data.error.message) {
        errMsg = err.data.error.message
      }

      // call the ui action later
      console.log(errMsg)
    }
    
  }


  const content = useMemo(() => {
    if (isLoading) {
      return <Spinner />;
    } else if (isError) {
      let errorMessage;
      const err = error as CustomErrorType;
      if (err.data.error.message) {
        errorMessage = err.data.error.message;
      } else {
        errorMessage = "An unknown error occurred. Please try again.";
      }
  
      return <p className="text-red-500 text-lg bg-black/50 p-4 rounded-lg">{errorMessage}</p>;
    } else if (isSuccess && movieResponse.movie) {
      const { movie } = movieResponse;
      return (
        <>
          <div className="flex flex-col md:flex-row flex-wrap gap-6 items-center md:items-start">
            <div className="max-w-[100%] md:max-w-[65%] flex flex-col items-center overflow-hidden rounded-lg shadow-md">
              <img
                className="max-w-[100%] h-auto"
                src={movie.image}
                alt={movie.title}
              />
            </div>
            <div className="flex flex-col gap-4 w-full md:w-[33%] flex-grow">
              {user?.role === "admin" && (
                <p className="flex justify-between gap-2 bg-black/30 p-4 rounded-lg">
                  <Button
                    btnClass="bg-red-600 hover:bg-red-700 transition-colors duration-300"
                    onClick={showDeleteModelHandler}
                  >
                    Delete
                  </Button>
                  <Button
                    btnClass="bg-yellow-600 hover:bg-yellow-700 transition-colors duration-300"
                    onClick={() => editMovieHandler(movie.id)}
                  >
                    Edit
                  </Button>
                </p>
              )}
  
              <h3 className="text-2xl text-red-500 font-extrabold p-4 bg-black/30 rounded-lg">
                {movie.title} ({movie.year})
              </h3>
  
              <p className="flex justify-between gap-2 bg-black/30 p-4 rounded-lg">
                <Button 
                  disabled={isFavLoading} 
                  btnClass={movie.is_favorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} 
                  onClick={() => handleAddFavorite(movie.id)}
                >
                  {!movie.is_favorite ? 'Add Favorite' : 'Remove Favorite'}
                </Button>
                <Button
                  btnClass="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                  onClick={showRatingModalHandler}
                >
                  Add Rating
                </Button>
              </p>
  
              <p className="flex flex-wrap justify-between gap-2 bg-black/30 p-4 rounded-lg">
                <span>Favorite: </span> <span className="text-red-400">{movie.total_favorites}</span>
              </p>
              <p className="flex justify-between gap-2 bg-black/30 p-4 rounded-lg">
                <span>Rating: </span> <span className="text-yellow-400">{movie.rating}&#47;10</span>
              </p>
              <div className="flex flex-wrap justify-between gap-2 bg-black/30 p-4 rounded-lg">
                Categories:{" "}
                <ul className="flex flex-wrap justify-center gap-2 list-none">
                  {Object.entries(movie.genres).map(([genreId, genreName]) => (
                    <li className="bg-red-900/50 rounded" key={genreId}>
                      <Link className="p-2 block hover:bg-red-800/50 transition-colors duration-300" to={`/movies?genre=${genreId}`}>
                        {genreName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="flex justify-between gap-2 bg-black/30 p-4 rounded-lg">
                <span>Release Date:</span>{" "}
                <span className="text-red-400">{formatDateDefault(movie.release_date)}</span>
              </p>
              <p className="flex justify-between gap-2 bg-black/30 p-4 rounded-lg">
                <span>Runtime: </span> <span className="text-red-400">{movie.runtime} min</span>
              </p>
              <p className="flex flex-wrap justify-between gap-2 bg-black/30 p-4 rounded-lg">
                <span>Comments:</span> <span className="text-red-400">{movie.total_comments}</span>
              </p>
            </div>
          </div>
          <p className="flex flex-col justify-between gap-1 bg-black/30 p-4 mt-4 text-sm rounded-lg">
            <span className="text-base text-red-400">Description: </span>
            {movie.description}
          </p>
          <div className="flex flex-col gap-6 justify-center mt-6 md:flex-row">
            <div className="flex-1">
              <AddCommentForm movieId={movie.id} />
            </div>
  
            <div className="flex-1 bg-black/30 p-4 md:h-[400px] overflow-y-scroll rounded-lg">
              <h4 className="text-center text-lg font-bold border-b-2 border-red-500 py-2 mb-4">
                Recent Comments ({movie.total_comments})
              </h4>
  
              <ul className="list-none">
                {movie.comments?.map((comment) => (
                  <li
                    className="flex flex-col gap-1 bg-black/50 rounded-lg my-3"
                    key={comment.id}
                  >
                    <h4 className="flex justify-between px-4 py-2 border-b border-red-900/50">
                      <span className="text-red-400">{comment.user_name}</span>{" "}
                      <span className="text-sm text-gray-400">
                        {formatDateDefault(comment.commented_at)}
                      </span>
                    </h4>
                    <p
                      className="break-words p-4 pt-2"
                      style={{ wordBreak: "break-all" }}
                    >
                      {comment.comment}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      );
    }
  
    return (
      <p className="text-red-500 text-lg bg-black/30 text-center w-fit mx-auto px-6 py-3 rounded-lg">
        No Movie Found!
      </p>
    );
  }, [isLoading, isError, error, isSuccess, movieResponse, user]);
  
  return (
    <article className="p-6 bg-gradient-to-br from-black to-red-900 text-gray-200 rounded-xl shadow-lg">
      {content}
      {showRatingModal && movieResponse?.movie.id && (
        <Modal onHandleClick={hideRatingModalHandler}>
          <AddRating
            maxStars={10}
            setShowRatingModal={setShowRatingModal}
            movieId={movieResponse?.movie?.id}
          />
        </Modal>
      )}
      {showDeleteModal && movieResponse?.movie.id && (
        <Modal onHandleClick={hideDeleteModelHandler}>
          <DeleteMovie movieId={movieResponse?.movie?.id} setShowRatingModal={setShowDeleteModal} />
        </Modal>
      )}
    </article>
  );
}

export default SingleMoviePage;
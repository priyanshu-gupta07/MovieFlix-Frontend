import { Link } from "react-router-dom"
import FavoriteSVG from "../../Design/Fav"
import { useManageFavoriteMutation } from "../../redux/services/movies"
import { useAppDispatch, useAppSelector } from "../../hooks/typeHooks"
import { useLocation, useNavigate } from "react-router-dom"
import { logoutAction } from "../../redux/features/authSlice"

import Button from "../../Design/Button"

interface MovieCarouselItemProps {
  item: MovieType
}

const MovieCarouselItem = ({item}: MovieCarouselItemProps) => {
  const [manageFavorite, {isLoading: isFavLoading}] = useManageFavoriteMutation()

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

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

  return (
  <div
    className="item bg-gradient-to-br from-black to-red-900 m-2 flex flex-col gap-3 rounded-lg overflow-hidden shadow-lg border border-red-800"
    data-value={item.id}
  >
    <div className="overflow-hidden max-w-[100%] h-80">
      <img
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        src={item.image}
        alt={item.title}
      />
    </div>
    <Link
      to={`/movie/${item.id}`}
      className="block text-center text-red-400 font-bold text-lg hover:text-red-300 transition-colors duration-300 py-2"
    >
      {item.title} ({item.year})
    </Link>
    <p className="text-sm flex justify-between px-4 text-gray-300">
      Rating:{" "}
      <span className="ps-3 text-yellow-500">{item.rating}&#47;10</span>
      <span className="ms-auto text-yellow-500 text-lg">&#10027;</span>
    </p>
    <div className="flex flex-row justify-between items-center text-sm bg-black/50 px-4 py-3">
      <p className="flex justify-center items-center gap-2">
        <Button 
          disabled={isFavLoading} 
          onClick={() => handleAddFavorite(item.id)} 
          btnClass="bg-transparent text-2xl text-red-500 hover:bg-red-900/50 active:bg-red-900/50 p-2 rounded-full transition-colors duration-300"
        >
          {item.is_favorite ? (
            <FavoriteSVG isFavorite={true} />
          ) : (
            <FavoriteSVG isFavorite={false} />
          )}
        </Button>
        <span className="text-gray-300">{item.total_favorites}</span>
      </p>
      <p className="text-gray-300">Comments: {item.total_comments}</p>
    </div>
  </div>
)
}

export default MovieCarouselItem
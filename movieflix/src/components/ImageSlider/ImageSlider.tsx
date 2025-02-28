import AliceCarousel from 'react-alice-carousel';
import { useGetFeatureMoviesQuery } from '../../redux/services/movies';
import { Link } from 'react-router-dom';

import classes from './ImageSlider.module.css';
import 'react-alice-carousel/lib/alice-carousel.css';

const ImageSlider = () => {
  const {data: featureMovies, isSuccess, isLoading, isError} = useGetFeatureMoviesQuery();
  let content;
  if (isLoading) {
    content = <p>Loading...</p>
  } else if (isError) {
   content =  <p>Something went wrong. Please try again.</p>
  } else if(isSuccess && featureMovies.movies) {
    const items = featureMovies.movies.map((movie) => (
      <div key={movie.id} className={classes.slider_item} data-value={movie.id}>
        <div className={classes.slider_image}>
          <img src={movie.image} alt={movie.title} />
        </div>
        <div className={classes.slider_title}>
          <Link className={classes.slider_title_link} to={`/movies/${movie.id}`}>
            {movie.title} ({movie.year})
          </Link>
        </div>
      </div>
    ));
    content = (<AliceCarousel
      items={items}
      autoPlay
      disableDotsControls
      autoPlayStrategy="none"
      autoPlayInterval={2000}
      animationDuration={2000}
      animationType="fadeout"
      infinite
      disableButtonsControls
    />)
  }

  return (
    <div className={classes.slider__container}>
      {content}
    </div>
  );
};

export default ImageSlider;

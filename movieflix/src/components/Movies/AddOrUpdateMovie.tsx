import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../Design/Input";
import Button from "../../Design/Button";
import useInput from "../../hooks/userInput";
import {
  validateTitle,
  validateMovieYear,
  validateRuntime,
  validateImage,
} from "../../utils/Validator";
import { useAddNewMovieMutation } from "../../redux/services/movies";
import { useGetAllGenresQuery } from "../../redux/services/genre";
import useFileInput from "../../hooks/useFileInput.tsx";
import axios from "axios";
import { getTokenFromLocalStorage } from "../../utils/getToken";

const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

interface PropsType {
  movieId: number | null;
}

type MyMovieGenres = {
  [key: string]: string;
};

const AddOrUpdateMovie = ({ movieId }: PropsType) => {
  const [movieGenres, setMovieGenres] = useState<MyMovieGenres>({});
  const [imageId, setImageId] = useState<null | number>();
  const [isUploading, setIsUploading] = useState(false);

  const [addNewMovie, { isLoading: loadingNewMovie }] =
    useAddNewMovieMutation();
  const { data: genres } = useGetAllGenresQuery();
  const [ReleaseDate, setReleaseDate] = useState("");

  const navigate = useNavigate();

  const validateImageInput = (value: File | null) => {
    const isTitle = validateImage(value);
    return isTitle.isValid ? null : isTitle.errorMsg || "Invalid Title!";
  };

  const validateTitleInput = (value: string) => {
    const isTitle = validateTitle(value);
    return isTitle.isValid ? null : isTitle.errorMsg || "Invalid Title!";
  };

  const validateYear = (value: string | null) => {
    const isYear = validateMovieYear(parseInt(value!));
    return isYear.isValid ? null : isYear.errorMsg || "Invalid Year!";
  };

  const validateRuntimeInput = (value: string | null) => {
    const isRuntime = validateRuntime(parseInt(value!));
    return isRuntime.isValid ? null : isRuntime.errorMsg || "Invalid Runtime!";
  };

  const {
    value: title,
    errorMsg: titleError,
    isTouched: istitleTouched,
    valueChangeHandler: titleChangeHandler,
    inputBlurHandler: titleBlurHandler,
  } = useInput(validateTitleInput);

  const {
    value: image,
    errorMsg: imageError,
    isTouched: isImageTouched,
    valueChangeHandler: imageChangeHandler,
    inputBlurHandler: imageBlurHandler,
  } = useFileInput(validateImageInput);

  const {
    value: description,
    errorMsg: descriptionError,
    isTouched: isDescriptionTouched,
    valueChangeHandler: descriptionChangeHandler,
    inputBlurHandler: descriptionBlurHandler,
  } = useInput(validateTitleInput);

  const {
    value: year,
    errorMsg: yearError,
    isTouched: isYearTouched,
    valueChangeHandler: yearChangeHandler,
    inputBlurHandler: yearBlurHandler,
  } = useInput(validateYear);

  const {
    value: runtime,
    errorMsg: runtimeError,
    isTouched: isRuntimeTouched,
    valueChangeHandler: runtimeChangeHandler,
    inputBlurHandler: runtimeBlurHandler,
  } = useInput(validateRuntimeInput);

  let formIsValid = false;

  if (!titleError && !descriptionError && !yearError && !runtimeError) {
    formIsValid = true;
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!Number(value)) return;

    const genre = genres?.genres?.find((item) => item.id === Number(value));
    if (genre) {
      setMovieGenres((prev) => {
        return {
          ...prev,
          [value]: genre.genre_name,
        };
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value)
    const date = new Date(e.target.value);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = `${date.getFullYear()}-${month}-${day}`;
    setReleaseDate(formattedDate.toString());
  };

  const handleUploadImage = async () => {
    const form = new FormData();

    const token = getTokenFromLocalStorage();
    if (!token) {
      return;
    }

    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    form.append("image", image as File);

    setIsUploading(true);
    try {
      const response = await axios.post(`${baseApiUrl}/images/upload`, form, {
        headers,
      });
      setImageId(response.data.id);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setIsUploading(false);
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIsValid || !imageId) {
      return;
    }

    const newMovie: MovieInputType = {
      title: title,
      description: description,
      runtime: runtime,
      release_date: ReleaseDate,
      genres: movieGenres,
      image_id: imageId.toString(),
      year: year,
    };

    try {
      const response = await addNewMovie(newMovie).unwrap();
      if ("id" in response) {
        navigate(`/movies/${response.id}`);
      }
    } catch (err) {
      const error = err as CustomErrorType;
      console.log(error);
    }
  };

  let genresContent;
  const genresArr = Object.keys(movieGenres);
  if (genresArr.length > 0) {
    genresContent = genresArr.map((item) => {
      return (
        <span key={item} className="bg-black rounded p-2">
          {movieGenres[item]}
        </span>
      );
    });
  }

  return (
    <form
      className="w-[800px] max-w-[100%] p-4 bg-white/10"
      onSubmit={handleOnSubmit}
    >
      <h3 className="text-2xl text-center my-2 font-bold">
        {movieId ? "Update Movie" : "New Movie"}
      </h3>
      <Input
        name="title"
        label="Title"
        placeholder="Enter the movie title here"
        type="text"
        onChange={titleChangeHandler}
        inputError={istitleTouched ? titleError : null}
        value={title}
        onBlur={titleBlurHandler}
      />

      {image && (
        <p className="max-h-[200px] w-[150px] mx-auto py-3">
          <img
            className="rounded max-h-[100%] max-w-[100%] border"
            src={URL.createObjectURL(image)}
            alt={title}
          />
        </p>
      )}
      {image && (
        <Button
          disabled={imageId || isUploading ? true : false}
          onClick={handleUploadImage}
          btnClass="me-auto block w-fit"
        >
          {isUploading ? "Uploading.." : "Upload Image"}
        </Button>
      )}
      {!imageId && (
        <>
          <Input
            type="file"
            label="Image"
            name="photos"
            id="Photos"
            onChange={imageChangeHandler}
            inputError={isImageTouched ? imageError : null}
            onBlur={imageBlurHandler}
          />
        </>
      )}
      <div className="my-2">
        <label className="block my-1 text-sm" htmlFor={"description"}>
          Desciption:{" "}
          {isDescriptionTouched && descriptionError && (
            <span className="ps-2 mb-3 p-4 text-red-500">
              {descriptionError}
            </span>
          )}
        </label>
        <textarea
          placeholder="Place your movie details here..."
          rows={4}
          name="description"
          id="message"
          className="w-full px-4 py-2 text-white bg-white/20"
          onChange={descriptionChangeHandler}
          onBlur={descriptionBlurHandler}
        ></textarea>
      </div>
      <Input
        name="Year"
        label="Year"
        placeholder="Enter Year of movie release (e.g., 2023)"
        type="number"
        value={year}
        pattern="[1950-2023]"
        inputError={isYearTouched ? yearError : null}
        onBlur={yearBlurHandler}
        onChange={yearChangeHandler}
      />
      <Input
        name="Runtime"
        label="Runtime"
        placeholder="Enter the movie runtime here"
        type="number"
        value={runtime}
        onChange={runtimeChangeHandler}
        inputError={isRuntimeTouched ? runtimeError : null}
        onBlur={runtimeBlurHandler}
      />
      <Input
        name="Release Date"
        label="Release Date"
        placeholder="Enter the movie release date here"
        type="date"
        onChange={handleDateChange}
      />

      <label>Genres</label>
      <p className="bg-white/10 my-2 text-sm p-2 rounded-sm flex gap-1 flex-wrap">
        {genresContent}
      </p>
      <select
        name="Genres"
        id="Genres"
        onChange={handleGenreChange}
        className="bg-white/50 w-[100%] flex-grow flex-shrink p-2 text-black rounded mt-3 my-2"
      >
        <option value="">Select Genres</option>
        {genres?.genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.genre_name}
          </option>
        ))}
      </select>

      <Button
        disabled={!formIsValid || loadingNewMovie}
        btnClass="my-3 block ms-auto"
        type="submit"
      >
        Submit
      </Button>
    </form>
  );
};

export default AddOrUpdateMovie;

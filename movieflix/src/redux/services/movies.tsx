import {createApi, BaseQueryFn } from  '@reduxjs/toolkit/query/react'
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { getTokenFromLocalStorage } from "../../utils/getToken";

const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

const axiosBaseQuery = 
({ baseUrl }: { baseUrl: string } ={baseUrl: ""}): BaseQueryFn<
{
    url: string;
    method?: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
},
unknown,
unknown
> => async ({ url, method="GET", data }) => {
    const authToken = getTokenFromLocalStorage();

    try {
        const result = await axios({
            url: baseUrl+url,
            method,
            data,
            headers: {
                Authorization: authToken ? `Bearer ${authToken}` : "",
            },
        });
        return { data: result.data };
    } catch (axiosError) {
        let error= axiosError as AxiosError;
        return { error: { status: error.response?.status, data: error.response?.data } };
    }
};

export const moviesApi = createApi({
    reducerPath: "movies-api",
    baseQuery: axiosBaseQuery({
      baseUrl: baseApiUrl,
    }),
    tagTypes: ["Movies-API", "All-Movies", "Single-Movie", "Feature-Movies", "Feature-Movies-Slide"],
    endpoints: (builder) => ({
        getFeatureMovies: builder.query<MoviesResponse, void>({
            query: () => ({url: '/movies/latest'}),
            providesTags: ["Feature-Movies-Slide"],
          }),
  
      getPopularMovies: builder.query<MoviesResponse, void>({
        query: () => ({url: '/movies?order_by=rating&limit=5'}),
        providesTags: ["Feature-Movies"],
      }),
  
      getActionMovies: builder.query<MoviesResponse, void>({
        query:()=> ({ url: `/movies/genre/${3}?limit=5` }),
        providesTags: ["Feature-Movies"],
      }),
  
      getDramaMovies: builder.query<MoviesResponse, void>({
        query: () => ({url: `/movies/genre/${1}?limit=5`}),
        providesTags: ["Feature-Movies"],
      }),
  
      getMysteryMovies: builder.query<MoviesResponse, void>({
        query: () => ({url: `/movies/genre/${6}?limit=5`}),
        providesTags: ["Feature-Movies"],
      }),
  
      getFilteredMovies: builder.query<MoviesResponse, string>({
        query: (url) => ({ url: `/${url}` }),
        providesTags: ["All-Movies"],
      }),
  
      getSingleMovie: builder.query<MovieResponse, number>({
        query: (id) => ({ url: `/movie/${id}` }),
        providesTags: ["Single-Movie"],
      }),
  
      createRating: builder.mutation<UpdateRatingResponse | CustomErrorType, RatingInputType> ({
        query: (ratingInput) => ({
          url: "/rating/add",
          method: "POST",
          data: ratingInput,
        }),
        invalidatesTags: ["Single-Movie", "All-Movies", "Feature-Movies"],
      }),
  
      manageFavorite: builder.mutation<UpdateRatingResponse | CustomErrorType, number> ({
        query: (movieId) => ({
          url: `/favorite/${movieId}`,
          method: "GET",
        }),
        invalidatesTags: ["Single-Movie", "All-Movies", "Feature-Movies"],
      }),
  
      addMovieComment: builder.mutation<UpdateRatingResponse | CustomErrorType, CommentInputType> ({
        query: (commentInput) => ({
          url: `/movie/comments/add`,
          method: "POST",
          data: commentInput,
        }),
        invalidatesTags: ["Single-Movie", "All-Movies"],
      }),
  
      addNewMovie: builder.mutation<MovieInsertResponseType | CustomErrorType, MovieInputType> ({
        query: (movieInputData) => ({
          url: `/admin/movie/add`,
          method: "POST",
          data: movieInputData,
        }),
        invalidatesTags: ["Single-Movie", "All-Movies"],
      }),
  
      deleteAMovie: builder.mutation<MovieInsertResponseType | CustomErrorType, number> ({
        query: (movieId) => ({
          url: `/admin/movie/delete/${movieId}`,
          method: "GET",
        }),
        invalidatesTags: ["Movies-API", "All-Movies", "Single-Movie", "Feature-Movies", "Feature-Movies-Slide"],
      }),
    }),
  });

  export const {
    useGetFeatureMoviesQuery,
    useGetPopularMoviesQuery,
    useGetActionMoviesQuery,
    useGetDramaMoviesQuery,
    useGetMysteryMoviesQuery,
    useGetFilteredMoviesQuery,
    useGetSingleMovieQuery,
    useCreateRatingMutation,
    useManageFavoriteMutation,
    useAddMovieCommentMutation,
    useAddNewMovieMutation,
    useDeleteAMovieMutation,
  } = moviesApi;
  
const express = require("express");
const movies = require("./movies.json");
const crypto = require("node:crypto");
const { validateMovie, validatePartialMovie } = require("./schemas/movies.js");
const cors = require("cors");
const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = ["http://127.0.0.1:5500"];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.get("/movies", (req, res) => {
  const { genre, rate } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  if (rate) {
    const filteredMovies = movies.filter((movie) => movie.rate >= rate);
    return res.json(filteredMovies);
  }

  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).json({
    message: "movie not found",
  });
});

app.post("/movies", (req, res) => {
  // const { title, year, director, duration, rate, poster, genre } = req.body;
  // const newMovie = {
  //   id: crypto.randomUUID(),
  //   title,
  //   genre,
  //   director,
  //   duration,
  //   year,
  //   rate: rate ?? 0,
  //   poster,
  // };

  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(400).json({
      error: JSON.parse(result.error.message),
    });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(red.body);

  if (result.error) {
    return res.status(400).json({
      error: JSON.parse(result.error.message),
    });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) return res.json(movie);
  res.status(404).json({
    message: "movie not found",
  });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;
  return res.json(updateMovie);
});
app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted" });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});

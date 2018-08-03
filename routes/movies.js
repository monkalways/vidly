const router = require('express').Router();

const movieService = require('../services/movies');
const genreService = require('../services/genres');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const movies = await movieService.getAll();
  res.json(movies);
});

router.get('/:id', async (req, res) => {
  const movie = await movieService.get(req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).end();
  }
});

router.post('/', auth, async (req, res) => {
  const validationResult = movieService.validate(req.body);
  if (validationResult) {
    return res.status(400).json({ message: validationResult.error.details[0].message });
  }

  for(let g of req.body.genres) {
    const genre = await genreService.get(g._id);
    g.name = genre.name;
  }

  const newMovie = await movieService.create(req.body);
  res.json(newMovie);
});

router.put('/:id', auth, async (req, res) => {
  const validationResult = movieService.validate(req.body);
  if (validationResult) {
    return res.status(400).json({ message: validationResult.error.details[0].message });
  }

  for(let g of req.body.genres) {
    const genre = await genreService.get(g._id);
    g.name = genre.name;
  }

  let movie = {
    _id: req.params.id,
    ...req.body,
  };

  movie = await movieService.update(movie);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).end();
  }
});

router.delete('/:id', auth, async (req, res) => {
  const movie = await movieService.remove(req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
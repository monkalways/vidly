const router = require('express').Router();

const genreService = require('../services/genres');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
  const courses = await genreService.getAll();
  res.json(courses);
});

router.get('/:id', validateObjectId, async (req, res) => {
  
  const genre = await genreService.get(req.params.id);
  if (genre) {
    res.json(genre);
  } else {
    res.status(404).end();
  }
});

router.post('/', [auth, validate(genreService.validate)], async (req, res) => {
  
  const newGenre = await genreService.create(req.body); 
  res.status(201).json(newGenre);
});

router.put('/:id', [auth, validateObjectId, validate(genreService.validate)], async (req, res) => {
  let genre = {
    _id: req.params.id,
    name: req.body.name,
  };

  genre = await genreService.update(genre);
  if(genre) {
    return res.json(genre);
  } else {
    return res.status(404).end();
  }
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await genreService.remove(req.params.id);
  if(genre) {
    return res.json(genre);
  } else {
    return res.status(404).end();
  }
});

module.exports = router;
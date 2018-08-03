const router = require('express').Router();
const Joi = require('joi');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const rentalService = require('../services/rentals');
const movieService = require('../services/movies');

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await rentalService.Rental.lookup(
    req.body.customerId,
    req.body.movieId,
  );
  if (!rental) {
    return res.status(404).end();
  } else if (rental.dateReturned) {
    return res
      .status(400)
      .send({ message: 'Movie is already returned' })
      .end();
  }

  rental.return();
  await rentalService.update(rental);

  const movie = await movieService.get(rental.movie._id);
  movie.numberInStock++;
  await movie.save();

  res.json(rental);
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  };
  return Joi.validate(req, schema);
}

module.exports = router;

const router = require('express').Router();

const rentalService = require('../services/rentals');
const customerService = require('../services/customers');
const movieService = require('../services/movies');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const rentals = await rentalService.getAll();
  res.json(rentals);
});

router.get('/:id', async (req, res) => {
  const rental = await rentalService.get(req.params.id);
  if (rental) {
    res.json(rental);
  } else {
    res.status(404).end();
  }
});

router.post('/', auth, async (req, res) => {
  const validationResult = rentalService.validate(req.body);
  if (validationResult.error) {
    return res.status(400).json({ message: validationResult.error.details[0].message });
  }

  const customer = await customerService.get(req.body.customerId);
  if (!customer) {
    return res.status(400).json({ message: 'Invalid customer' });
  }

  const movie = await movieService.get(req.body.movieId);
  if (!movie) {
    return res.status(400).json({ message: 'Invalid movie' });
  } else if (movie.numberInStock === 0) {
    return res.status(400).json({ message: 'Movie out of stock' });
  }

  let newRental = {
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
    movie: {
      _id: movie.id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  };

  newRental = await rentalService.create(newRental);

  movie.numberInStock--;
  movieService.update(movie);

  res.status(201).json(newRental);
});

module.exports = router;

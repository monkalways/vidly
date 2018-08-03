const mongoose = require('mongoose');
const request = require('supertest');

require('../../startup/validation')();
const app = require('../../app');
const { User } = require('../../services/users');
const { Rental } = require('../../services/rentals');
const { Movie } = require('../../services/movies');
const { Genre } = require('../../services/genres');

describe('/api/returns', () => {
  let customerId, movieId, rental, movie, genre;

  beforeAll((done) => {
    require('../../startup/db')(done);
  });

  beforeEach(async (done) => {
    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();
    let dateOut = new Date();
    dateOut.setDate(dateOut.getDate() - 2);

    genre = new Genre({
      name: 'genre1',
    });
    await genre.save();

    movie = new Movie({
      _id: movieId,
      title: 'movie1',
      numberInStock: 1,
      dailyRentalRate: 2,
      genres: [genre],
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: 'customer1',
        phone: '12345',
        isGold: false,
      },
      movie,
      dateOut,
    });

    await rental.save();
    done();
  });

  afterEach(async (done) => {
    await Rental.remove({});
    await Movie.remove({});
    await Genre.remove({});
    done();
  });

  describe('POST /', () => {
    let token;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    const exec = function() {
      return request(app)
        .post('/api/returns')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
      customerId = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
      movieId = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if customerId is not valid object id', async () => {
      customerId = '123';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not valid object id', async () => {
      movieId = '123';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for this customer/movie', async () => {
      movieId = new mongoose.Types.ObjectId().toHexString();
      customerId = new mongoose.Types.ObjectId().toHexString();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 400 if rental is already returned', async () => {
      rental.dateReturned = Date.now();
      await rental.save();

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 200 if request is valid', async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      rental = await Rental.findById(rental._id);
      expect(rental.dateReturned).not.toBeNull();
      expect(rental.rentalFee).toBeCloseTo(4);

      movie = await Movie.findById(movie._id);
      expect(movie.numberInStock).toBe(2);

      expect(res.body).toMatchObject(JSON.parse(JSON.stringify(rental)));
    });
  });
});

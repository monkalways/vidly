const mongoose = require('mongoose');
const Joi = require('joi');

const Movie = mongoose.model(
  'Movie',
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      min: 5,
      max: 255,
    },
    numberInStock: {
      type: Number,
      default: 0,
    },
    dailyRentalRate: {
      type: Number,
      default: 0,
    },
    genres: {
      type: [
        mongoose.Schema({
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
          },
          name: {
            type: String,
            required: true,
          },
        }),
      ],
      required: true,
    },
  }),
);

function validate(movie) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  }
  return Joi.validate(movie, schema);
}

async function getAll() {
  return await Movie.find().sort('title');
}

async function get(id) {
  return await Movie.findById(id);
}

async function create(movie) {
  const newMovie = new Movie(movie);
  return await newMovie.save();
}

async function update(movie) {
  return await Movie.findByIdAndUpdate(
    movie._id,
    {
      $set: movie,
    },
    {
      new: true,
      runValidators: true,
    },
  );
}

async function remove(id) {
  return await Movie.findByIdAndRemove({
    _id: id,
  });
}

module.exports = {
  Movie,
  getAll,
  get,
  create,
  update,
  remove,
  validate,
};

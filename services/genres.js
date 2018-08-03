const mongoose = require('mongoose');
const Joi = require('joi');

const Genre = mongoose.model(
  'Genre',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
  }),
);

function validate(genre) {
  const schema = {
    name: Joi.string().min(5).max(50).required()
  }
  return Joi.validate(genre, schema);
}

async function getAll() {
  return await Genre.find().sort('name');
}

async function get(id) {
  return await Genre.findById(id);
}

async function create(genre) {
  const newGenre = new Genre({ ...genre });
  return await newGenre.save();
}

async function update(genre) {
  return await Genre.findByIdAndUpdate(
    {
      _id: genre._id,
    },
    {
      $set: genre,
    },
    {
      runValidators: true,
      new: true,
    },
  );
}

async function remove(id) {
  return await Genre.findByIdAndRemove({
    _id: id,
  });
}

module.exports = {
  Genre,
  getAll,
  get,
  create,
  update,
  remove,
  validate,
};

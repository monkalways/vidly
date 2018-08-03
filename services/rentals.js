const mongoose = require('mongoose');
const Joi = require('joi');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      isGold: {
        type: Boolean,
        required: true,
      },
    }),
    required: true,
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },
  dateOut: {
    type: Date,
    default: Date.now,
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

rentalSchema.statics.lookup = function(customerId, movieId) {
  return Rental.findOne({
    'customer._id': customerId,
    'movie._id': movieId,
  });
};

rentalSchema.methods.return = function() {
  this.dateReturned = Date.now();
  this.rentalFee =
    this.movie.dailyRentalRate *
    dateDiff(this.dateOut, this.dateReturned);
};

const Rental = mongoose.model(
  'Rental',
  rentalSchema,
);

function validate(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  };
  return Joi.validate(rental, schema);
}

async function getAll() {
  return await Rental.find().sort('-dateOut');
}

async function get(id) {
  return await Rental.findById(id);
}

async function create(rental) {
  const newRental = new Rental({ ...rental });
  return await newRental.save();
}

async function update(rental) {
  return await Rental.findByIdAndUpdate(
    {
      _id: rental._id,
    },
    {
      $set: rental,
    },
    {
      runValidators: true,
      new: true,
    },
  );
}

async function remove(id) {
  return await Rental.findByIdAndRemove({
    _id: id,
  });
}

function dateDiff(first, second) {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

module.exports = {
  Rental,
  getAll,
  get,
  create,
  update,
  remove,
  validate,
};

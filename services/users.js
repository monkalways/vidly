const mongoose = require('mongoose');
const Joi = require('Joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
    },
    config.get('jwtPrivateKey'),
  );
}

const User = mongoose.model('User', userSchema);

function validate(user) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .required(),
  };
  return Joi.validate(user, schema);
}

function validateLoginRequest(loginRequest) {
  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .required(),
  };
  return Joi.validate(loginRequest, schema);
}

async function getAll() {
  return await User.find().sort('name');
}

async function get(id) {
  return await User.findById(id);
}

async function getByEmail(email) {
  return await User.findOne({ email });
}

async function create(user) {
  user.password = await hashPassword(user.password);
  const newUser = new User(user);
  return await newUser.save();
}

async function update(user) {
  return await User.findByIdAndUpdate(
    {
      _id: user._id,
    },
    {
      $set: user,
    },
    {
      new: true,
      runValidators: true,
    },
  );
}

async function remove(id) {
  return await User.findByIdAndRemove({
    _id: id,
  });
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

module.exports = {
  User,
  validate,
  validateLoginRequest,
  getAll,
  get,
  getByEmail,
  create,
  update,
  remove,
};

const mongoose = require('mongoose');

const Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
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
);

function validate(customer) {
  const customerModel = new Customer(customer);
  return customerModel.validateSync();
}

async function getAll() {
  return await Customer.find().sort('name');
}

async function get(id) {
  return await Customer.findById(id);
}

async function create(customer) {
  const newCustomer = new Customer(customer);
  return await newCustomer.save();
}

async function update(customer) {
  return await Customer.findByIdAndUpdate(
    {
      _id: customer._id,
    },
    {
      $set: customer,
    },
    {
      runValidators: true,
      new: true,
    },
  );
}

async function remove(id) {
  return await Customer.findByIdAndRemove(id);
}

module.exports = {
  getAll,
  get,
  create,
  update,
  remove,
  validate,
};

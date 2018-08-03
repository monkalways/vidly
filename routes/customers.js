const router = require('express').Router();

const customerService = require('../services/customers');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const customers = await customerService.getAll();
  res.json(customers);
});

router.get('/:id', async (req, res) => {
  const customer = await customerService.get(req.params.id);
  res.json(customer);
});

router.post('/', auth, async (req, res) => {
  const validationResult = customerService.validate(req.body);
  if (validationResult) {
    return res.status(400).json({ message: validationResult.message });
  }

  const newCustomer = await customerService.create(req.body);
  res.json(newCustomer);
});

router.put('/:id', auth, async (req, res) => {
  const validationResult = customerService.validate(req.body);
  if (validationResult) {
    return res.status(400).json({ message: validationResult.message });
  }

  let customer = {
    _id: req.params.id,
    ...req.body,
  };

  customer = await customerService.update(customer);
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).end();
  }
});

router.delete('/:id', auth, async (req, res) => {
  const customer = await customerService.remove(req.params.id);
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).end();
  }
});

module.exports = router;

const router = require('express').Router();
const _ = require('lodash');

const userService = require('../services/users');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const users = await userService.getAll();
  res.json(users);
});

router.get('/me', auth, async (req, res) => {
  const user = await userService.get(req.user._id);
  if (user) {
    res.json(_.pick(user, ['_id', 'name', 'email']));
  } else {
    res.status(404).end();
  }
});

router.post('/', auth, async (req, res) => {
  const validationResult = userService.validate(req.body);
  if (validationResult.error) {
    res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }

  const user = await userService.getByEmail(req.body.email);
  if(user) {
    res.status(400).json({message: 'The email is already registered.'});
  }

  const newUser = await userService.create(req.body);

  res.header('x-auth-token', newUser.generateAuthToken()).json(_.pick(newUser, ['_id', 'name', 'email']));
});

router.put('/:id', auth, async (req, res) => {
  const validationResult = userService.validate(req.body);
  if (validationResult.error) {
    res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }

  let user = {
    _id: req.params.id,
    ...req.body,
  };

  user = await userService.update(user);
  if(user) {
    return res.json(user);
  } else {
    return res.status(404).end();
  }
});

router.delete('/:id', auth, async (req, res) => {
  const user = await userService.remove(req.params.id);
  if(user) {
    return res.json(user);
  } else {
    return res.status(404).end();
  }
});

module.exports = router;

const router = require('express').Router();
const bcrypt = require('bcryptjs');

const userService = require('../services/users');

router.post('/', async (req, res) => {
  const validationResult = userService.validateLoginRequest(req.body);
  if (validationResult.error) {
    res
      .status(400)
      .json({ message: validationResult.error.details[0].message });
  }

  const user = await userService.getByEmail(req.body.email);
  if (!user) {
    res.status(400).json({ message: 'Invalid email or password.' });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(400).json({ message: 'Invalid email or password.' });
  }

  res.send(user.generateAuthToken());
});

module.exports = router;

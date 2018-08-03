const request = require('supertest');
const { User } = require('../../services/users');
const { Genre } = require('../../services/genres');

const app = require('../../app');

describe('auth middleware', () => {
  let token;

  beforeAll(done => {
    require('../../startup/db')(done);
  });

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  afterEach(async (done) => {
    await Genre.remove({});
    done();
  });

  const exec = () => {
    return request(app)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });
  };

  it('should return 401 if no token is provided', async () => {
    token = '';
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'INVALID_TOKEN';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(201);
  });
});

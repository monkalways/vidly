const request = require('supertest');
const { Genre } = require('../../services/genres');
const { User } = require('../../services/users');
const mongoose = require('mongoose');

const app = require('../../app');

describe('/api/genres', () => {
  beforeAll((done) => {
    require('../../startup/db')(done);
  });

  afterEach(async (done) => {
    await Genre.remove({});
    done();
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1' },
        { name: 'genre2' },
      ]);

      const res = await request(app).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return genre if genre id exists', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const res = await request(app).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: genre.name });
    });

    it('should return 404 if genre id does not exist', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/genres/${id.toHexString()}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 if genre id is not valid Object Id', async () => {
      const res = await request(app).get('/api/genres/123');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token, name;

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    });

    const exec = async () => {
      return await request(app)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      name = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 201 if genre is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', name);

      const genreInDb = await Genre.findOne({ name });
      expect(genreInDb).not.toBeNull();
    });
  });

  describe('PUT /:id', () => {
    let id, name, token;

    beforeEach(() => {
      id = new mongoose.Types.ObjectId().toHexString();
      name = 'genre2';
      token = new User().generateAuthToken();
    });

    const exec = function() {
      return request(app)
        .put(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send({ name });
    };

    it('should return 401 if token is not valid', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if name is shorter than 5 characters', async () => {
      name = 'asdf';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is longer than 500 characters', async () => {
      name = new Array(502).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if genre id is not valid Object Id', async () => {
      id = '123';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if genre id does not exist', async () => {
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 200 if genre is valid', async () => {
      const newGenre = new Genre({ name: 'genre1' });
      await newGenre.save();
      id = newGenre._id;

      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name });

      const genre = await Genre.findOne({ name });
      expect(genre).toMatchObject({ name });
    });
  });

  describe('DELETE /:id', () => {
    let id, token;

    beforeEach(() => {
      id = new mongoose.Types.ObjectId().toHexString();
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = async function() {
      return request(app)
        .delete(`/api/genres/${id}`)
        .set('x-auth-token', token);
    }

    it('should return 401 if token is not valid', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 404 if genre id is not valid Object Id', async () => {
      id = '123';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if genre id does not exist', async () => {
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 403 if user token is not admin', async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it('should return 200 if genre id exits', async () => {
      const newGenre = new Genre({ name: 'genre1' });
      await newGenre.save();
      id = newGenre._id;

      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'genre1' });

      const genre = await Genre.findById(id);
      expect(genre).toBeNull();
    });
  })
});

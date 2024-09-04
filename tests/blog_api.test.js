const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
    {
        title: 'Testikirja',
        author: 'Äijä Äijänen',
        url: 'osote.fi',
        likes: 444,
    },
    {
        title: 'Testi2',
        author: 'Maija Matikainen',
        url: 'osote.ru',
        likes: 6,
    },
]


beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('returns right amount of blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, 2)
})

test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')

    const blogs = response.body

    blogs.forEach(blog => {
        assert.ok(blog.id)
        assert.strictEqual(blog._id, undefined)
    })
})

test('a valid blog can be added with HTTP-post', async () => {
    const newBlog = {
        title: 'Aletaan ryyppää',
        author: 'Tuntematon',
        url: 'https://coop.com',
        likes: 10000000000
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    assert(titles.includes('Aletaan ryyppää'))
})

after(async () => {
    await mongoose.connection.close()
})
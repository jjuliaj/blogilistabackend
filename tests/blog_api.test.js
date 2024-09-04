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

test('a blog can be added', async () => {
    const uusiBlog = {
        title: 'Aletaan ryyppää',
        author: 'Tuntematon',
        url: 'https://coop.com',
        likes: 10000000000
    }

    const initialResponse = await api.get('/api/blogs')
    const initialBlogs = initialResponse.body.length

    await api
        .post('/api/blogs')
        .send(uusiBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body

    assert.strictEqual(blogs.length, initialBlogs + 1)

    const titles = blogs.map(blog => blog.title)
    assert.ok(titles.includes(uusiBlog.title))

    const addedBlog = blogs.find(addedBlog => addedBlog.title === uusiBlog.title)
    assert.strictEqual(addedBlog.author, uusiBlog.author)
    assert.strictEqual(addedBlog.url, uusiBlog.url)
    assert.strictEqual(addedBlog.likes, uusiBlog.likes)
})

after(async () => {
    await mongoose.connection.close()
})
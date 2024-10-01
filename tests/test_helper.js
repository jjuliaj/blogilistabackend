const Blog = require('../models/blog')

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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb
}

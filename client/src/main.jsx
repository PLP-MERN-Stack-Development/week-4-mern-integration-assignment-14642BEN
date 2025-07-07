// ======== client/src/main.jsx ========
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ======== client/src/App.jsx ========
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </>
  );
}

// ======== client/src/components/Navbar.jsx ========
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#eee' }}>
      <Link to="/">Home</Link> | <Link to="/create">Create Post</Link>
    </nav>
  );
}

// ======== client/src/components/PostList.jsx ========
import { Link } from 'react-router-dom';

export default function PostList({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <div key={post._id} style={{ marginBottom: '1rem' }}>
          <h3>{post.title}</h3>
          <p>{post.content.substring(0, 100)}...</p>
          <Link to={`/posts/${post._id}`}>Read more</Link>
        </div>
      ))}
    </div>
  );
}

// ======== client/src/components/PostForm.jsx ========
import { useState, useEffect } from 'react';

export default function PostForm({ onSubmit, initialData, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required /><br />
      <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Content" required /><br />
      <select name="category" value={formData.category} onChange={handleChange} required>
        <option value="">Select category</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select><br />
      <button type="submit">Submit</button>
    </form>
  );
}

// ======== client/src/pages/Home.jsx ========
import { useEffect, useState } from 'react';
import PostList from '../components/PostList';
import axios from 'axios';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('/api/posts').then(res => setPosts(res.data));
  }, []);

  return (
    <div>
      <h2>All Posts</h2>
      <PostList posts={posts} />
    </div>
  );
}

// ======== client/src/pages/PostDetails.jsx ========
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`/api/posts/${id}`).then(res => setPost(res.data));
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <p><b>Category:</b> {post.category?.name}</p>
    </div>
  );
}

// ======== client/src/pages/CreatePost.jsx ========
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function CreatePost() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data));
  }, []);

  const handleSubmit = async (data) => {
    await axios.post('/api/posts', data);
    navigate('/');
  };

  return <PostForm onSubmit={handleSubmit} categories={categories} />;
}

// ======== client/src/pages/EditPost.jsx ========
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import axios from 'axios';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`/api/posts/${id}`).then(res => setInitialData(res.data));
    axios.get('/api/categories').then(res => setCategories(res.data));
  }, [id]);

  const handleSubmit = async (data) => {
    await axios.put(`/api/posts/${id}`, data);
    navigate(`/posts/${id}`);
  };

  return initialData ? <PostForm initialData={initialData} onSubmit={handleSubmit} categories={categories} /> : <p>Loading...</p>;
}

// ======== client/src/hooks/useApi.js ========
import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (url, method = 'get', body = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios({ url, method, data: body })
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};

export default useApi;

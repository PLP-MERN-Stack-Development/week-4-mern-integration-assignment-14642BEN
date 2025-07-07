// ======== client/src/api/api.js ========
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchPosts = () => API.get('/posts');
export const fetchPost = id => API.get(`/posts/${id}`);
export const createPost = data => API.post('/posts', data);
export const updatePost = (id, data) => API.put(`/posts/${id}`, data);
export const deletePost = id => API.delete(`/posts/${id}`);
export const fetchCategories = () => API.get('/categories');
export const createCategory = data => API.post('/categories', data);

// ======== client/src/context/PostContext.jsx ========
import { createContext, useContext, useState, useEffect } from 'react';
import { fetchPosts, fetchCategories } from '../api/api';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postRes, catRes] = await Promise.all([fetchPosts(), fetchCategories()]);
        setPosts(postRes.data);
        setCategories(catRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <PostContext.Provider value={{ posts, setPosts, categories, loading, error }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);

// ======== Updated client/src/pages/CreatePost.jsx ========
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { createPost } from '../api/api';
import { usePostContext } from '../context/PostContext';

export default function CreatePost() {
  const navigate = useNavigate();
  const { categories, setPosts, posts } = usePostContext();

  const handleSubmit = async (data) => {
    const tempPost = { ...data, _id: Date.now().toString() }; // optimistic
    setPosts([tempPost, ...posts]);
    try {
      const res = await createPost(data);
      setPosts([res.data, ...posts]);
    } catch (err) {
      alert('Failed to create post');
      setPosts(posts); // rollback
    }
    navigate('/');
  };

  return <PostForm onSubmit={handleSubmit} categories={categories} />;
}

// ======== Updated client/src/pages/Home.jsx ========
import PostList from '../components/PostList';
import { usePostContext } from '../context/PostContext';

export default function Home() {
  const { posts, loading, error } = usePostContext();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>All Posts</h2>
      <PostList posts={posts} />
    </div>
  );
}

// ======== Updated client/src/components/PostForm.jsx (with image upload) ========
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PostForm({ onSubmit, initialData, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: null,
    imageUrl: ''
  });

  useEffect(() => {
    if (initialData) setFormData(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await axios.post('/api/upload', data);
      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      alert('Image upload failed');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { ...formData };
    delete payload.image;
    onSubmit(payload);
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
      <input type="file" accept="image/*" onChange={handleImage} /><br />
      {formData.imageUrl && <img src={formData.imageUrl} alt="preview" width="200" />}<br />
      <button type="submit">Submit</button>
    </form>
  );
}

// ======== Updated client/src/pages/Home.jsx (pagination + search) ========
import { useEffect, useState } from 'react';
import PostList from '../components/PostList';
import axios from 'axios';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/posts?page=${page}&limit=${limit}&q=${query}`)
      .then(res => setPosts(res.data))
      .finally(() => setLoading(false));
  }, [page, query]);

  return (
    <div>
      <h2>All Posts</h2>
      <input
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: '1rem' }}
      /><br />
      {loading ? <p>Loading...</p> : <PostList posts={posts} />}
      <button onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Prev</button>
      <button onClick={() => setPage(prev => prev + 1)}>Next</button>
    </div>
  );
}

// ======== Updated client/src/pages/PostDetails.jsx (comments feature) ========
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get(`/api/posts/${id}`).then(res => setPost(res.data));
    axios.get(`/api/comments/${id}`).then(res => setComments(res.data));
  }, [id]);

  const handleComment = async () => {
    if (!text) return;
    const res = await axios.post('/api/comments', {
      postId: id,
      username: user.username,
      text
    });
    setComments([res.data, ...comments]);
    setText('');
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      {post.imageUrl && <img src={post.imageUrl} alt="featured" width="300" />}<br />
      <p>{post.content}</p>
      <p><b>Category:</b> {post.category?.name}</p>
      <hr />
      <h3>Comments</h3>
      {user && (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment..." /><br />
          <button onClick={handleComment}>Submit</button>
        </>
      )}
      {comments.map((c, i) => (
        <p key={i}><b>{c.username}</b>: {c.text}</p>
      ))}
    </div>
  );
}

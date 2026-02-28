import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${ process.env.REACT_APP_API_BASE_URL }/posts`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <h1>Welcome to Website</h1>
      <p>This is a modern full-stack web application</p>
      
      <section className="posts">
        <h2>Latest Posts</h2>
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Home.css'

const Home = ({ user }) => {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/quiz/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuizzes(response.data.quizzes || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQuizStats = () => {
    const totalQuizzes = quizzes.length
    const openQuizzes = quizzes.filter(quiz => quiz.isOpen).length
    const myQuizzes = user.role === 'Teacher'
      ? quizzes.filter(quiz => quiz.teacher._id === user.id).length
      : 0

    return { totalQuizzes, openQuizzes, myQuizzes }
  }

  const { totalQuizzes, openQuizzes, myQuizzes } = getQuizStats()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to Quizzy, {user.name}!</h1>
        <div className="user-role-badge">
          {user.role} {user.role === 'Teacher' ? '👨‍🏫' : '👨‍🎓'}
        </div>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          {user.role === 'Teacher'
            ? 'You can create and manage quizzes'
            : 'You can take quizzes and view your results'}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <div className="stat-number">{totalQuizzes}</div>
          <p>Available on platform</p>
        </div>
        <div className="stat-card">
          <h3>Open Quizzes</h3>
          <div className="stat-number">{openQuizzes}</div>
          <p>Ready to take</p>
        </div>
        {user.role === 'Teacher' && (
          <div className="stat-card">
            <h3>My Quizzes</h3>
            <div className="stat-number">{myQuizzes}</div>
            <p>Created by you</p>
          </div>
        )}
      </div>

      {user.role === 'Student' && (
        <div className="student-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <div
              className="action-btn primary"
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer' }}
            >
              View Available Quizzes
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

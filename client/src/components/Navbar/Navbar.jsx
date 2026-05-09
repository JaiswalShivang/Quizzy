import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ user, setLoginUser }) => {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    setLoginUser({})
    navigate('/login')
  }

  return (
    <div className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          Quizzy
        </div>

        <div className="navbar-right">
          <div
            className="nav-link"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            Dashboard
          </div>

          {user.role === 'Student' && (
            <div
              className="nav-link"
              onClick={() => navigate('/subscribe')}
              style={{ cursor: 'pointer' }}
            >
              Subscriptions
            </div>
          )}

          {user.role === 'Teacher' && (
            <div
              className="nav-link"
              onClick={() => navigate('/manage-subscriptions')}
              style={{ cursor: 'pointer' }}
            >
              Requests
            </div>
          )}

          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar

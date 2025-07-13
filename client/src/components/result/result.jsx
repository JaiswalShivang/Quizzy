import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './result.css'

const Result = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:3000/api/quiz/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setQuiz(response.data.quiz)
      } catch (error) {
        console.error('Error fetching quiz:', error)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [id, navigate])

  const getTotalMarks = () => {
    return quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0)
  }


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading results...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="error-container">
        <div className="error-text">Quiz not found</div>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    )
  }

  const totalMarks = getTotalMarks()
  const responses = quiz.responses || []

  return (
    <div className="result-container">
      <div className="result-header">
        <h1>Quiz Results</h1>
        <h2>{quiz.title}</h2>
        <p>Teacher: {quiz.teacher.name}</p>
      </div>

      <div className="quiz-summary">
        <h3>Quiz Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Questions:</span>
            <span>{quiz.questions.length}</span>
          </div>
          <div className="summary-item">
            <span>Total Marks:</span>
            <span>{totalMarks}</span>
          </div>
          <div className="summary-item">
            <span>Status:</span>
            <span className={quiz.isOpen ? 'status-open' : 'status-closed'}>
              {quiz.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <div className="summary-item">
            <span>Total Responses:</span>
            <span>{responses.length}</span>
          </div>
        </div>
      </div>

      {user.role === 'Teacher' && responses.length > 0 && (
        <div className="student-results">
          <h3>Student Results</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response, index) => {
                  const percentage = Math.round((response.totalScore / totalMarks) * 100)
                  return (
                    <tr key={index}>
                      <td>{response.student?.name || 'Unknown'}</td>
                      <td>{response.totalScore}/{totalMarks}</td>
                      <td>{percentage}%</td>
                      <td>{new Date(response.submittedAt).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {user.role === 'Teacher' && responses.length === 0 && (
        <div className="no-results">
          <h3>No Submissions Yet</h3>
          <p>Students haven't submitted any responses for this quiz.</p>
        </div>
      )}

      <div className="result-actions">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
        {user.role === 'Teacher' && (
          <button className="preview-btn" onClick={() => navigate(`/quiz/${id}`)}>
            Preview Quiz
          </button>
        )}
      </div>
    </div>
  )
}

export default Result

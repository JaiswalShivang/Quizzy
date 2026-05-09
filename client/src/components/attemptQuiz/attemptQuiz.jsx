import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api'
import './attemptQuiz.css'

const AttemptQuiz = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userSubmission, setUserSubmission] = useState(null)

  const fetchQuiz = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuiz(response.data.quiz)
      setUserSubmission(response.data.userSubmission)
      setAnswers(new Array(response.data.quiz.questions.length).fill(-1))
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast.error('Failed to load quiz')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const goToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex)
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuiz = async () => {
    if (user.role !== 'Student') {
      toast.error('Only students can submit quiz answers')
      return
    }

    if (answers.includes(-1)) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return
      }
    }

    const processedAnswers = answers

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token ? 'Present' : 'Missing')

      const response = await api.post(`/quiz/${id}/submit`, { answers: processedAnswers }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })

      console.log('Response:', response.data)
      toast.success(`Quiz submitted! Your score: ${response.data.data.totalScore}/${response.data.data.maxScore}`)
      navigate('/dashboard')
    } catch (error) {

      if (error.response?.data?.data?.alreadySubmitted) {
        toast.info('You have already submitted this quiz!')
        // Refresh the page to show the completed state
        window.location.reload()
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit quiz')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Quiz not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!quiz.isOpen && user.role === 'Student') {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Quiz is closed</h2>
          <p>This quiz is not currently open for submissions.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (userSubmission && userSubmission.hasSubmitted && user.role === 'Student') {
    return (
      <div className="quiz-completed-container">
        <div className="score-display">
          <h1>Quiz Completed!</h1>
          <div className="score-card">
            <h2>Your Score</h2>
            <div className="score-number">
              {userSubmission.totalScore}/{userSubmission.maxScore}
            </div>
            <div className="score-percentage">
              {Math.round((userSubmission.totalScore / userSubmission.maxScore) * 100)}%
            </div>
            <p>Submitted on: {new Date(userSubmission.submittedAt).toLocaleString()}</p>
          </div>
          <div className="quiz-info">
            <h3>{quiz.title}</h3>
            <p>Teacher: {quiz.teacher.name}</p>
          </div>
          <button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const answeredCount = answers.filter(ans => ans !== -1).length

  return (
    <div className="attempt-quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{quiz.title}</h1>
          <p>Teacher: {quiz.teacher.name}</p>
        </div>
        <div className="quiz-progress">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>Answered: {answeredCount}/{quiz.questions.length}</span>
        </div>
      </div>

      <div className="question-navigation">
        <div className="question-numbers">
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={`question-number ${
                index === currentQuestion ? 'current' :
                answers[index] !== -1 ? 'answered' : 'unanswered'
              }`}
              onClick={() => goToQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <h2>Question {currentQuestion + 1}</h2>
          <div className="question-marks">{currentQ.marks} marks</div>
        </div>

        <div className="question-text">
          <p>{currentQ.title}</p>
        </div>

        <div className="answer-options">
          {currentQ.answer.map((option, index) => (
            <div
              key={index}
              className={`answer-option ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswerSelect(index)}
              />
              <div className="answer-text">{option}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          className="btn btn-secondary"
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        <div className="nav-center">
          <button
            className="btn btn-primary"
            onClick={submitQuiz}
            disabled={submitting || user.role !== 'Student'}
          >
            {submitting ? 'Submitting...' :
             user.role === 'Student' ? 'Submit Quiz' : 'Preview Only (Teacher)'}
          </button>
        </div>

        <button
          className="btn btn-secondary"
          onClick={nextQuestion}
          disabled={currentQuestion === quiz.questions.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AttemptQuiz

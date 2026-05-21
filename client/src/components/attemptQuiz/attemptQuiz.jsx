import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  // processing = submitted via Kafka but score not yet saved
  const [processing, setProcessing] = useState(false)
  const pollRef = useRef(null)

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
      console.log(error)
      toast.error('Failed to load quiz')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchQuiz() }, [fetchQuiz])

  // Poll for result after async submission
  const startPolling = useCallback(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 15 // 15 × 2s = 30s max
    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const token = localStorage.getItem('token')
        const res = await api.get(`/quiz/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const sub = res.data.userSubmission
        if (sub && sub.hasSubmitted) {
          clearInterval(pollRef.current)
          setProcessing(false)
          setUserSubmission(sub)
          toast.success(`Score ready: ${sub.totalScore}/${sub.maxScore}`)
        }
      } catch { /* ignore */ }
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollRef.current)
        setProcessing(false)
        toast.info('Score is still processing. Check back on the dashboard.')
        navigate('/dashboard')
      }
    }, 2000)
  }, [id, navigate])

  useEffect(() => () => clearInterval(pollRef.current), [])

  const handleAnswerSelect = (idx) => {
    const a = [...answers]
    a[currentQuestion] = idx
    setAnswers(a)
  }

  const submitQuiz = async () => {
    if (user.role !== 'Student') {
      toast.error('Only students can submit quiz answers')
      return
    }
    if (answers.includes(-1)) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) return
    }
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await api.post(`/quiz/${id}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // 202 Accepted — Kafka received it, worker will grade it
      if (response.status === 202) {
        setProcessing(true)
        toast.info('Submission received! Calculating your score…')
        startPolling()
      }
    } catch (error) {
      if (error.response?.data?.data?.alreadySubmitted) {
        toast.info('You have already submitted this quiz!')
        fetchQuiz()
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('being processed')) {
        toast.warning('Your submission is already being processed. Please wait.')
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
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>Quiz not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  if (!quiz.isOpen && user.role === 'Student') {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>Quiz is Closed</h2>
          <p>This quiz is not currently open for submissions.</p>
          <br />
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  // Processing state — submission received, waiting for worker
  if (processing) {
    return (
      <div className="attempt-quiz-container">
        <div className="processing-banner">
          <div className="poll-spinner" />
          <h2>Grading in Progress</h2>
          <p>Your submission was received successfully. The Kafka worker is calculating your score. This usually takes a few seconds…</p>
        </div>
      </div>
    )
  }

  if (userSubmission && userSubmission.hasSubmitted && user.role === 'Student') {
    return (
      <div className="quiz-completed-container">
        <div className="score-display">
          <h1>Quiz Completed! 🎉</h1>
          <div className="score-card">
            <h2>Your Score</h2>
            <div className="score-number">{userSubmission.totalScore}/{userSubmission.maxScore}</div>
            <div className="score-percentage">
              {Math.round((userSubmission.totalScore / userSubmission.maxScore) * 100)}%
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Submitted on: {new Date(userSubmission.submittedAt).toLocaleString()}
            </p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{quiz.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Teacher: {quiz.teacher.name}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const answeredCount = answers.filter(a => a !== -1).length

  return (
    <div className="attempt-quiz-container">
      <div className="quiz-top-bar">
        <div>
          <h1>{quiz.title}</h1>
          <p>Teacher: {quiz.teacher.name}</p>
        </div>
        <div className="quiz-progress-info">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>Answered: {answeredCount}/{quiz.questions.length}</span>
        </div>
      </div>

      <div className="question-nav-panel">
        <div className="question-bubbles">
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={`q-bubble ${index === currentQuestion ? 'current' : answers[index] !== -1 ? 'answered' : 'unanswered'}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="question-panel">
        <div className="question-meta">
          <h2>Question {currentQuestion + 1}</h2>
          <span className="question-marks-badge">{currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}</span>
        </div>
        <div className="question-body">
          <p>{currentQ.title}</p>
          <div className="answer-choices">
            {currentQ.answer.map((option, index) => (
              <div
                key={index}
                className={`answer-choice ${answers[currentQuestion] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <input
                  type="radio"
                  name={`q-${currentQuestion}`}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswerSelect(index)}
                />
                <span className="choice-text">{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-nav-bar">
        <button className="btn btn-secondary" onClick={() => setCurrentQuestion(q => q - 1)} disabled={currentQuestion === 0}>
          ← Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={submitQuiz}
          disabled={submitting || user.role !== 'Student'}
        >
          {submitting ? 'Submitting…' : user.role === 'Student' ? 'Submit Quiz' : 'Preview Only (Teacher)'}
        </button>
        <button className="btn btn-secondary" onClick={() => setCurrentQuestion(q => q + 1)} disabled={currentQuestion === quiz.questions.length - 1}>
          Next →
        </button>
      </div>
    </div>
  )
}

export default AttemptQuiz

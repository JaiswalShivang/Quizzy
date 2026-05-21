import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api'
import './CreateQuiz.css'

const CreateQuiz = ({ user }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    if (user && user.role && user.role !== 'Teacher') {
      toast.error('Only teachers can create quizzes')
      navigate('/dashboard')
    }
  }, [user, navigate])
  const [quiz, setQuiz] = useState({
    title: '',
    isOpen: false,
    questions: []
  })
  const [currentQuestion, setCurrentQuestion] = useState({
    title: '',
    answer: ['', '', '', ''],
    correctIndex: 0,
    marks: 1
  })

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target
    setQuiz(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAnswerChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      answer: prev.answer.map((ans, i) => i === index ? value : ans)
    }))
  }

  const addQuestion = () => {
    if (currentQuestion.title && currentQuestion.answer.every(ans => ans.trim())) {
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }))
      setCurrentQuestion({
        title: '',
        answer: ['', '', '', ''],
        correctIndex: 0,
        marks: 1
      })
    } else {
      toast.warning('Please fill all question fields and answers')
    }
  }

  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const createQuiz = async () => {
    if (!quiz.title || quiz.questions.length === 0) {
      toast.warning('Please provide quiz title and at least one question')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await api.post('/quiz/create', quiz, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      toast.success('Quiz created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error(error.response?.data?.message || 'Failed to create quiz')
    }
  }

  return (
    <div className="create-quiz-container">
      <div className="page-header">
        <h1>Create New Quiz</h1>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </div>

      <div>
        <div className="form-panel">
          <h2>Quiz Information</h2>
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              name="title"
              value={quiz.title}
              onChange={handleQuizChange}
              placeholder="Enter quiz title"
              className="input"
            />
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              name="isOpen"
              checked={quiz.isOpen}
              onChange={handleQuizChange}
            />
            Make quiz available to students immediately
          </label>
        </div>

        <div className="form-panel">
          <h2>Questions ({quiz.questions.length})</h2>

          {quiz.questions.length === 0 && (
            <div className="empty-state">
              <p>No questions added yet. Add your first question below.</p>
            </div>
          )}

          {quiz.questions.map((question, index) => (
            <div key={index} className="question-card">
              <div className="question-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3>Q{index + 1}</h3>
                  <span className="marks-badge">{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
                </div>
                <button className="remove-btn" onClick={() => removeQuestion(index)} title="Remove">✕</button>
              </div>
              <p className="question-text">{question.title}</p>
              <div className="answers-list">
                {question.answer.map((ans, i) => (
                  <div key={i} className={`answer-item ${i === question.correctIndex ? 'correct' : ''}`}>
                    <span className="answer-label">{String.fromCharCode(65 + i)}.</span>
                    <span className="answer-text">{ans}</span>
                    {i === question.correctIndex && <span className="correct-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

       
          <div className="add-question-form">
            <h3>+ Add New Question</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Question *</label>
                <textarea name="title" value={currentQuestion.title} onChange={handleQuestionChange} placeholder="Enter your question…" rows="3" className="textarea" />
              </div>
              <div className="form-group">
                <label>Marks</label>
                <input type="number" name="marks" value={currentQuestion.marks} onChange={handleQuestionChange} min="1" max="10" className="marks-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Answer Options — select the correct one</label>
              <div className="answer-options-builder">
                {currentQuestion.answer.map((answer, index) => (
                  <div key={index} className="answer-option-row">
                    <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                    <input type="text" value={answer} onChange={(e) => handleAnswerChange(index, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + index)}`} className="option-input" />
                    <label className="correct-radio-label">
                      <input type="radio" name="correctAnswer" checked={currentQuestion.correctIndex === index} onChange={() => setCurrentQuestion(prev => ({ ...prev, correctIndex: index }))} />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button className="add-question-btn" onClick={addQuestion}>+ Add Question</button>
          </div>
        </div>

        <div className="form-actions-row">
          <button className="create-quiz-btn" onClick={createQuiz} disabled={!quiz.title || quiz.questions.length === 0}>
            Create Quiz ({quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz

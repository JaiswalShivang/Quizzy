import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/quiz/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasUserSubmitted = (quiz) => {
    if (user?.role !== 'Student' || !quiz?.responses) return false;
    return quiz.responses.some(response =>
      response?.student?._id === user?.id
    );
  };

  const getUserScore = (quiz) => {
    if (user?.role !== 'Student' || !quiz?.responses) return null;
    const userResponse = quiz.responses.find(response =>
      response?.student?._id === user?.id
    );
    return userResponse?.totalScore || 0;
  };

  const getFilteredQuizzes = () => {
    if (filter === "open") return quizzes.filter((quiz) => quiz.isOpen);
    if (filter === "closed") return quizzes.filter((quiz) => !quiz.isOpen);
    return quizzes;
  };

  const takeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const viewResults = (quizId) => {
    navigate(`/results/${quizId}`);
  };

  const toggleQuizStatus = async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:3000/api/quiz/${quizId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        // Refresh the quizzes list
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error toggling quiz status:", error);
      alert(error.response?.data?.message || "Failed to update quiz status");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <div className="quizzes-container">
      <div className="quizzes-header">
        <div>
          <h1>
            {user.role === "Teacher" ? "My Quizzes" : "Available Quizzes"}
          </h1>
          <p style={{ color: "#666", fontSize: "14px", margin: "5px 0 0 0" }}>
            {user.role === "Teacher"
              ? "Manage your created quizzes and view student responses"
              : "Browse and take available quizzes"}
          </p>
        </div>
        {user.role === "Teacher" && (
          <div
            className="create-quiz-header-btn"
            onClick={() => navigate("/createquiz")}
          >
            Create New Quiz
          </div>
        )}
      </div>

      <div className="quizzes-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "open" ? "active" : ""}`}
            onClick={() => setFilter("open")}
          >
            Open
          </button>
          <button
            className={`filter-btn ${filter === "closed" ? "active" : ""}`}
            onClick={() => setFilter("closed")}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="quizzes-grid">
        {filteredQuizzes.length === 0 ? (
          <div className="no-quizzes">
            <h3>No quizzes found</h3>
            <p>
              {user.role === "Teacher"
                ? "Create your first quiz to get started!"
                : "No quizzes available at the moment."}
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <h3>{quiz.title}</h3>
                <div
                  className={`status-badge ${quiz.isOpen ? "open" : "closed"}`}
                >
                  {quiz.isOpen ? "Open" : "Closed"}
                </div>
              </div>

              <div className="quiz-card-body">
                <div className="quiz-info">
                  <p>
                    <strong>Questions:</strong> {quiz.questions?.length || 0}
                  </p>
                  <p>
                    <strong>Total Marks:</strong>{" "}
                    {quiz.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {user.role === "Student" && (
                    <>
                      <p>
                        <strong>Teacher:</strong> {quiz.teacher.name}
                      </p>
                      {hasUserSubmitted(quiz) && (
                        <p>
                          <strong>Your Score:</strong> {getUserScore(quiz) || 0}/{quiz.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0}
                        </p>
                      )}
                    </>
                  )}

                </div>
              </div>

              <div className="quiz-card-actions">
                {user.role === "Student" ? (
                  hasUserSubmitted(quiz) ? (
                    <div className="btn btn-success">
                      ✓ Completed
                    </div>
                  ) : quiz.isOpen ? (
                    <div
                      className="btn btn-primary"
                      onClick={() => takeQuiz(quiz._id)}
                      style={{ cursor: "pointer" }}
                    >
                      Take Quiz
                    </div>
                  ) : (
                    <div className="btn btn-disabled">Quiz Closed</div>
                  )
                ) : (
                  <>
                    <div
                      className="btn btn-outline"
                      onClick={() => viewResults(quiz._id)}
                      style={{ cursor: "pointer" }}
                    >
                      View Results
                    </div>
                    <div
                      className="btn btn-secondary"
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      Preview
                    </div>
                    <div
                      className={`btn ${
                        quiz.isOpen ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => toggleQuizStatus(quiz._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {quiz.isOpen ? "Close Quiz" : "Open Quiz"}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

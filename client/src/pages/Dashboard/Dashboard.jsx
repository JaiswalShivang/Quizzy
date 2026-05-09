import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [roleStat, setRoleStat] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [quizResponse, roleResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/quiz/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        user.role === "Teacher"
          ? axios.get("http://localhost:3000/api/subscription/requests", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : axios.get("http://localhost:3000/api/subscription/my", {
              headers: { Authorization: `Bearer ${token}` },
            }),
      ]);

      setQuizzes(quizResponse.data.quizzes || []);
      setRoleStat(
        user.role === "Teacher"
          ? roleResponse.data.requests?.length || 0
          : roleResponse.data.subscriptions?.length || 0
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token, user.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(() => {
    const open = quizzes.filter((quiz) => quiz.isOpen).length;
    const closed = quizzes.length - open;
    const totalQuestions = quizzes.reduce(
      (sum, quiz) => sum + (quiz.questions?.length || 0),
      0
    );

    return { total: quizzes.length, open, closed, totalQuestions };
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    if (filter === "open") return quizzes.filter((quiz) => quiz.isOpen);
    if (filter === "closed") return quizzes.filter((quiz) => !quiz.isOpen);
    return quizzes;
  }, [filter, quizzes]);

  const totalMarks = (quiz) =>
    quiz.questions?.reduce((sum, question) => sum + (question.marks || 1), 0) || 0;

  const toggleQuizStatus = async (quizId) => {
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await axios.patch(
        `http://localhost:3000/api/quiz/${quizId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStatusMessage(response.data.message);
        fetchDashboardData();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update quiz status.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">{user.role} Workspace</p>
          <h1>{user.role === "Teacher" ? "Teaching Dashboard" : "Student Dashboard"}</h1>
          <p className="head-subtitle">
            {user.role === "Teacher"
              ? "Create quizzes, control access, and manage incoming subscription requests."
              : "Track your quiz feed from approved teachers and attempt open quizzes quickly."}
          </p>
        </div>
        <div className="head-actions">
          {user.role === "Teacher" ? (
            <>
              <button className="btn btn-primary" onClick={() => navigate("/createquiz")}>
                + Create Quiz
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/manage-subscriptions")}>
                View Requests
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate("/subscribe")}>
              Discover Teachers
            </button>
          )}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span>Total Quizzes</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Open Quizzes</span>
          <strong>{stats.open}</strong>
        </div>
        <div className="stat-card">
          <span>{user.role === "Teacher" ? "Pending Requests" : "Approved Teachers"}</span>
          <strong>{roleStat}</strong>
        </div>
        <div className="stat-card">
          <span>Total Questions</span>
          <strong>{stats.totalQuestions}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-group">
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
        <button className="btn btn-secondary" onClick={fetchDashboardData}>
          Refresh
        </button>
      </div>

      {statusMessage ? <div className="dashboard-message success">{statusMessage}</div> : null}
      {errorMessage ? <div className="dashboard-message error">{errorMessage}</div> : null}

      <div className="quiz-grid">
        {filteredQuizzes.length === 0 ? (
          <div className="empty-state">
            <h3>No quizzes for this filter.</h3>
            <p>
              {user.role === "Teacher"
                ? "Create a new quiz to start publishing content."
                : "Subscribe to more teachers to expand your quiz feed."}
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <article className="quiz-card" key={quiz._id}>
              <div className="quiz-header">
                <h3>{quiz.title}</h3>
                <span className={`status-pill ${quiz.isOpen ? "open" : "closed"}`}>
                  {quiz.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <div className="quiz-meta">
                <div>
                  <span>Questions</span>
                  <strong>{quiz.questions?.length || 0}</strong>
                </div>
                <div>
                  <span>Total Marks</span>
                  <strong>{totalMarks(quiz)}</strong>
                </div>
                <div>
                  <span>Created</span>
                  <strong>
                    {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "N/A"}
                  </strong>
                </div>
                {user.role === "Student" ? (
                  <div>
                    <span>Teacher</span>
                    <strong>{quiz.teacher?.name || "Unknown"}</strong>
                  </div>
                ) : null}
              </div>

              <div className="quiz-actions">
                {user.role === "Teacher" ? (
                  <>
                    <button className="btn btn-secondary" onClick={() => navigate(`/results/${quiz._id}`)}>
                      Results
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate(`/quiz/${quiz._id}`)}>
                      Preview
                    </button>
                    <button
                      className={`btn ${quiz.isOpen ? "btn-danger" : "btn-success"}`}
                      onClick={() => toggleQuizStatus(quiz._id)}
                    >
                      {quiz.isOpen ? "Close Quiz" : "Open Quiz"}
                    </button>
                  </>
                ) : (
                  <button
                    className={`btn ${quiz.isOpen ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                  >
                    {quiz.isOpen ? "Attempt Quiz" : "View Quiz"}
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

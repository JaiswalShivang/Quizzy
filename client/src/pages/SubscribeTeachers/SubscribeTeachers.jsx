import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./SubscribeTeachers.css";
import axios from "axios";

const SubscribeTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchSubscriptions();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/auth/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/subscription/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestSubscription = async (teacherId) => {
    setRequesting(teacherId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/subscription/request",
        { teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Subscription request sent!");
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setRequesting(null);
    }
  };

  const getSubStatus = (teacherId) => {
    const sub = subscriptions.find(s => s.teacher._id === teacherId);
    if (!sub) return null;
    return sub.status; // "pending" | "approved" | "rejected"
  };

  const initials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="subscribe-teachers-container">
      <h1>Find Teachers</h1>
      <p>Subscribe to teachers to access their quizzes.</p>
      <div className="teachers-list">
        {teachers.length === 0 && (
          <div className="empty-state">
            <h3>No teachers found</h3>
            <p>There are no teachers registered yet.</p>
          </div>
        )}
        {teachers.map((teacher) => {
          const status = getSubStatus(teacher._id);
          return (
            <div key={teacher._id} className="teacher-card">
              <div className="teacher-info-wrap">
                <div className="teacher-avatar">{initials(teacher.name)}</div>
                <div className="teacher-info">
                  <h3>{teacher.name}</h3>
                  <p>{teacher.email}</p>
                </div>
              </div>
              <div className="teacher-actions">
                {status === "approved" ? (
                  <span className="subscribed-badge">✓ Subscribed</span>
                ) : status === "pending" ? (
                  <span className="pending-badge">⏳ Pending</span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => requestSubscription(teacher._id)}
                    disabled={requesting === teacher._id}
                  >
                    {requesting === teacher._id ? "Sending…" : "Subscribe"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscribeTeachers;

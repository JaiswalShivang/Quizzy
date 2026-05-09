import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SubscribeTeachers.css";

const SubscribeTeachers = ({ user }) => {
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
      // For now, fetch all users with role Teacher
      // In a real app, you might have a dedicated endpoint
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Subscription request sent!");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error requesting subscription:", error);
      alert(error.response?.data?.message || "Failed to send request");
    } finally {
      setRequesting(null);
    }
  };

  const isSubscribed = (teacherId) => {
    return subscriptions.some(sub => sub.teacher._id === teacherId);
  };

  const isPending = (teacherId) => {
    return subscriptions.some(sub => sub.teacher._id === teacherId && sub.status === "pending");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="subscribe-teachers-container">
      <h1>Subscribe to Teachers</h1>
      <p>Select teachers to subscribe to their quizzes.</p>
      <div className="teachers-list">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="teacher-card">
            <div className="teacher-info">
              <h3>{teacher.name}</h3>
              <p>{teacher.email}</p>
            </div>
            <div className="teacher-actions">
              {isSubscribed(teacher._id) ? (
                <span className="subscribed">Subscribed</span>
              ) : isPending(teacher._id) ? (
                <span className="pending">Request Pending</span>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => requestSubscription(teacher._id)}
                  disabled={requesting === teacher._id}
                >
                  {requesting === teacher._id ? "Sending..." : "Subscribe"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribeTeachers;
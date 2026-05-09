import React, { useState, useEffect } from "react";
import api from "../../api";
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
      const token = localStorage.getItem("token");
      const response = await api.get("/auth/teachers", {
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
      const response = await api.get("/subscription/my", {
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
      await api.post(
        "/subscription/request",
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

  const getSubscriptionStatus = (teacherId) => {
    const sub = subscriptions.find(sub => sub.teacher._id === teacherId);
    return sub ? sub.status : null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="subscribe-teachers-container">
      <h1>Subscribe to Teachers</h1>
      <p>Select teachers to subscribe to their quizzes.</p>
      <div className="teachers-list">
        {teachers.map((teacher) => {
          const status = getSubscriptionStatus(teacher._id);
          return (
            <div key={teacher._id} className="teacher-card">
              <div className="teacher-info">
                <h3>{teacher.name}</h3>
                <p>{teacher.email}</p>
              </div>
              <div className="teacher-actions">
                {status === "approved" ? (
                  <span className="subscribed">Subscribed</span>
                ) : status === "pending" ? (
                  <span className="pending">Request Pending</span>
                ) : status === "rejected" ? (
                  <div>
                    <span className="rejected">Rejected</span>
                    <button
                      className="btn btn-primary"
                      onClick={() => requestSubscription(teacher._id)}
                      disabled={requesting === teacher._id}
                    >
                      {requesting === teacher._id ? "Sending..." : "Re-request"}
                    </button>
                  </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default SubscribeTeachers;
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./ManageSubscriptions.css";
import axios from "axios";

const ManageSubscriptions = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/subscription/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (subscriptionId, action) => {
    setResponding(subscriptionId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/subscription/respond",
        { subscriptionId, action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Request ${action}d!`);
      fetchRequests();
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error(error.response?.data?.message || "Failed to respond");
    } finally {
      setResponding(null);
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
    <div className="manage-subscriptions-container">
      <h1>Manage Subscription Requests</h1>
      <p>Approve or reject student requests to subscribe to your quizzes.</p>
      <div className="requests-list">
        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="student-info">
                <h3>{request.student.name}</h3>
                <p>{request.student.email}</p>
              </div>
              <div className="request-actions">
                <button
                  className="btn btn-success"
                  onClick={() => respondToRequest(request._id, "approve")}
                  disabled={responding === request._id}
                >
                  {responding === request._id ? "Processing..." : "Approve"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => respondToRequest(request._id, "reject")}
                  disabled={responding === request._id}
                >
                  {responding === request._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageSubscriptions;

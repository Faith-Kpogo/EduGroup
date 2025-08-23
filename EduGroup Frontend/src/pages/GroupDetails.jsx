import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Edit, MoreVertical } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import axios from 'axios';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(res.data);
      } catch (err) {
        console.error("Error fetching group details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4">Loading group details...</div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="p-4">Group not found.</div>
      </MainLayout>
    );
  }

  // ✅ Search filter
  const filteredStudents = group.students.filter((s) =>
    s.index_number.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Gender counts
  const maleCount = group.students.filter(s => s.gender === "Male").length;
  const femaleCount = group.students.filter(s => s.gender === "Female").length;

  return (
    <MainLayout>
      <div className="p-4 flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              <span className="text-white fw-bold">
                {group.name?.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="mb-0">{group.name}</h4>
              <small className="text-muted">{group.course_name || "N/A"}</small>
            </div>
            <span className="badge bg-success ms-2">{group.status || "Active"}</span>
          </div>

          <div className="d-flex gap-2">
            <button className="btn mainbtn">
              <Edit size={16} className="me-1" /> Edit
            </button>
            <button className="btn btn-outline-secondary">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded shadow-sm p-3 mb-4">
          <h5>Group Overview</h5>
          <div className="row">
            <div className="col-md-4">
              <p><strong>Total students</strong></p>
              <p>{group.students.length}</p>
            </div>
            <div className="col-md-4">
              <p><strong>Gender Distribution</strong></p>
              <ul className="list-unstyled">
                <li>Male: {maleCount}</li>
                <li>Female: {femaleCount}</li>
              </ul>
            </div>
            <div className="col-md-4">
              <p><strong>Performance Distribution</strong></p>
              <ul className="list-unstyled">
                <li>High: {group.performance?.high || 0}</li>
                <li>Average: {group.performance?.average || 0}</li>
                <li>Low: {group.performance?.low || 0}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded shadow-sm p-3">
          <h5>Student list</h5>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search by index number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredStudents.length === 0 ? (
            <div className="alert alert-info">No students found.</div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Index Number</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.index_number}</td>
                    <td>{s.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GroupDetails;

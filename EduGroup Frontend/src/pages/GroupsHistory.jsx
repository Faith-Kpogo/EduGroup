import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/GroupsHistory.css';
import Table from '../components/Table';
import axios from 'axios';
import * as XLSX from "xlsx";

const GroupsHistory = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/groups/history", {
  headers: { Authorization: `Bearer ${token}` },
});
setGroups(res.data);
setFilteredGroups(res.data);

      } catch (err) {
        console.error("Error fetching groups history:", err);
      }
    };
    fetchGroups();
  }, []);

  // ✅ Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredGroups(groups);
    } else {
      setFilteredGroups(
        groups.filter(
          (g) =>
            g.group_name.toLowerCase().includes(search.toLowerCase()) ||
            g.course_name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, groups]);

  // ✅ Export to Excel
  const handleExport = () => {
    const dataToExport = filteredGroups.map((g, idx) => ({
      "No.": idx + 1,
      "Group Name": g.group_name,
      "Course": g.course_name,
      "Date Created": new Date(g.created_at).toLocaleDateString(),
      "Students": g.student_count,
      "Status": g.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GroupsHistory");
    XLSX.writeFile(wb, "Groups_History.xlsx");
  };

  // ✅ Analytics
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.status === "Active").length;
  const totalStudents = groups.reduce((sum, g) => sum + g.student_count, 0);

  return (
    <MainLayout>
      <div className="d-flex">
        <div className="main-content px-4 pt-4">
          <h3 className="mb-1">Groups History</h3>
          <p className="text-muted mb-4">View previously generated student groups</p>

          <div className="mainsection bg-white p-4 rounded shadow-sm px-4 pt-4">
            {/* Filters */}
            <div className="d-flex gap-3 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search groups"
                style={{ maxWidth: "200px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn mainbtn d-flex align-items-center gap-2"
                onClick={handleExport}
              >
                <Download size={18} /> Export
              </button>
            </div>

            {/* Groups Table */}
            <Table data={filteredGroups} />

            {/* Pagination placeholder */}
            <div className="d-flex pt-5 justify-content-end align-items-center">
              <nav>
                <ul className="pagination mb-0">
                  <li className="page-item disabled">
                    <span className="page-link">
                      <ChevronLeft size={18} /> Previous
                    </span>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">1</span>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">
                      Next <ChevronRight size={18} />
                    </span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Analytics */}
          <div className="main2 bg-white p-4 mt-4 rounded shadow-sm text-center">
            <h5 className="mb-4 text-start">Groups Analytics</h5>
            <div className="row">
              <div className="col">
                <h4>{totalGroups}</h4>
                <p>Total Groups</p>
              </div>
              <div className="col">
                <h4>{activeGroups}</h4>
                <p>Active Groups</p>
              </div>
              <div className="col">
                <h4>{totalStudents}</h4>
                <p>Students Assigned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GroupsHistory;

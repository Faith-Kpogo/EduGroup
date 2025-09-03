import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import "../Styles/GroupsHistory.css";
import Table from "../components/Table";
import axios from "axios";
import * as XLSX from "xlsx";

const GroupsHistory = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");

  const [timeFilter, setTimeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;

  // inside useEffect after fetching groups
useEffect(() => {
  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://edugroup.onrender.com/api/groups/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Transform raw groups into batch summary
      const batches = Object.values(
        res.data.reduce((acc, g) => {
          if (!acc[g.batch_id]) {
            acc[g.batch_id] = {
              batch_id: g.batch_id,
              course_name: g.course_name,
              created_at: g.created_at,
              status: g.status,
              total_groups: 0,
              total_students: 0,
            };
          }
          acc[g.batch_id].total_groups += 1;
          acc[g.batch_id].total_students += g.student_count || 0;
          return acc;
        }, {})
      );

      setGroups(batches);
      setFilteredGroups(batches);
    } catch (err) {
      console.error("Error fetching groups history:", err);
    }
  };
  fetchGroups();
}, []);


  // ✅ Filtering
  useEffect(() => {
    let result = [...groups];

    if (search.trim()) {
  const searchTerm = search.toLowerCase();
  result = result.filter(
    (g) =>
      (g.course_name && g.course_name.toLowerCase().includes(searchTerm))
  );
}


    if (courseFilter !== "All") {
      result = result.filter((g) => g.course_name === courseFilter);
    }



    if (timeFilter !== "All") {
      const now = new Date();
      result = result.filter((g) => {
        const created = new Date(g.created_at);
        if (timeFilter === "Last 7 days") {
          return (now - created) / (1000 * 60 * 60 * 24) <= 7;
        } else if (timeFilter === "Last 30 days") {
          return (now - created) / (1000 * 60 * 60 * 24) <= 30;
        }
        return true;
      });
    }

    setFilteredGroups(result);
    setCurrentPage(1);
  }, [search, courseFilter, timeFilter, groups]);

  // ✅ Pagination
  const indexOfLastGroup = currentPage * groupsPerPage;
const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);
  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // ✅ Export to Excel
  const handleExport = () => {
    const dataToExport = filteredGroups.map((g, idx) => ({
      "No.": idx + 1,
      "Group Name": g.group_name,
      Course: g.course_name,
      "Date Created": new Date(g.created_at).toLocaleDateString(),
      Students: g.student_count,
      Status: g.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GroupsHistory");
    XLSX.writeFile(wb, "Groups_History.xlsx");
  };

  // ✅ Analytics
  const totalGroups = groups.length;
const activeGroups = groups.filter(
  (g) => g.status && g.status.toLowerCase() === "active"
).length;
const totalStudents = groups.reduce((sum, g) => sum + (g.total_students || 0), 0);


  return (
    <MainLayout>
      <div className="d-flex">
        <div className="main-content px-4 pt-4">
          <h3 className="mb-1">Groups History</h3>
          <p className="text-muted mb-4">View previously generated student groups</p>

          <div className="mainsection bg-white p-4 rounded shadow-sm px-4 pt-4">
            {/* Filters */}
            <div className="d-flex gap-3 mb-3 flex-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search groups"
                style={{ maxWidth: "200px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="form-select"
                style={{ maxWidth: "150px" }}
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option>All</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <select
                className="form-select"
                style={{ maxWidth: "180px" }}
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option>All</option>
                {[...new Set(groups.map((g) => g.course_name))].map((course, i) => (
                  <option key={i}>{course}</option>
                ))}
              </select>

              <button
                className="btn mainbtn d-flex align-items-center gap-2"
                onClick={handleExport}
              >
                <Download size={18} /> Export
              </button>
            </div>

            {/* Groups Table */}
            {/* ✅ FIX: Ensure we only pass currentGroups */}
            <Table data={currentGroups} />

            {/* Pagination */}
            <div className="d-flex pt-5 justify-content-end align-items-center">
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <span className="page-link" onClick={prevPage}>
                      <ChevronLeft size={18} /> Previous
                    </span>
                  </li>
                  {[...Array(totalPages)].map((_, idx) => (
                    <li
                      key={idx}
                      className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
                    >
                      <span className="page-link" onClick={() => setCurrentPage(idx + 1)}>
                        {idx + 1}
                      </span>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <span className="page-link" onClick={nextPage}>
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
                <p>Total Students Grouped</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GroupsHistory;

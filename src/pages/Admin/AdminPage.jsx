import React, { useEffect, useState, useMemo } from "react";
import AdminSection from "../../components/Admin/AdminSection";
import { jobAPI, companyAPI, cvAPI } from "../../services/auth.services";
import { message } from "antd";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Card, Row, Col, Select, Statistic, Skeleton } from "antd";
import {
  SolutionOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./AdminPage.css"; // CSS mới

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // QUAN TRỌNG: Cho phép full chiều cao
  plugins: {
    legend: { position: "bottom", labels: { padding: 20 } },
  },
  animation: { duration: 800 },
};

function AdminPage() {
  const [jobStats, setJobStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [cvStats, setCvStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([jobAPI.getAllJobs(), companyAPI.getAll(), cvAPI.getMyCVs()])
      .then(([jobsRes, companiesRes, cvsRes]) => {
        setJobStats(jobsRes.data || []);
        setCompanyStats(companiesRes.data || []);
        setCvStats(cvsRes.data || []);
      })
      .catch(() => message.error("Không thể tải dữ liệu!"))
      .finally(() => setLoading(false));
  }, []);

  const totalJobs = jobStats.length;
  const totalCompanies = companyStats.length;
  const totalCVs = cvStats.length;

  const jobStatusCount = useMemo(() => {
    const count = { APPROVED: 0, PENDING: 0, REJECTED: 0 };
    jobStats.forEach((job) => {
      const status = job.status || (job.approved ? "APPROVED" : "PENDING");
      count[status] = (count[status] || 0) + 1;
    });
    return count;
  }, [jobStats]);

  const companyStatusCount = useMemo(() => {
    const count = { APPROVED: 0, PENDING: 0 };
    companyStats.forEach((c) => {
      count[c.approved === false ? "PENDING" : "APPROVED"]++;
    });
    return count;
  }, [companyStats]);

  const cvByMonth = useMemo(() => {
    const months = Array(12).fill(0);
    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    cvStats.forEach((cv) => {
      const date = new Date(cv.createdAt);
      if (date.getFullYear() === selectedYear) months[date.getMonth()]++;
    });
    return { labels, data: months };
  }, [cvStats, selectedYear]);

  const years = [
    ...new Set(cvStats.map((cv) => new Date(cv.createdAt).getFullYear())),
  ].sort((a, b) => b - a);

  if (loading) {
    return (
      <AdminSection>
        <div className="loading-wrapper">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </AdminSection>
    );
  }

  return (
    <AdminSection>
      <div className="admin-dashboard">
        <div className="dashboard-title">
          <h1>Thống kê hệ thống</h1>
          <p>Theo dõi toàn diện hoạt động tuyển dụng</p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="stats-grid">
          <Col xs={24} sm={12} lg={8}>
            <div className="stat-card">
              <SolutionOutlined className="stat-icon job" />
              <Statistic
                title="Tổng Job"
                value={totalJobs}
                valueStyle={{ color: "#007aff" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="stat-card">
              <BankOutlined className="stat-icon company" />
              <Statistic
                title="Công ty"
                value={totalCompanies}
                valueStyle={{ color: "#34c759" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="stat-card">
              <FileTextOutlined className="stat-icon cv" />
              <Statistic
                title="CV ứng tuyển"
                value={totalCVs}
                valueStyle={{ color: "#ff9f0a" }}
              />
            </div>
          </Col>
        </Row>

        {/* Year Filter */}
        {years.length > 0 && (
          <div className="year-filter">
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              size="large"
              className="select-year"
            >
              {years.map((year) => (
                <Select.Option key={year} value={year}>
                  Năm {year}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        {/* Charts */}
        <Row gutter={[24, 24]}>
          {/* Job Status */}
          <Col xs={24} lg={12}>
            <Card title="Trạng thái Job" className="chart-card">
              <div className="chart-container">
                <Bar
                  data={{
                    labels: ["Đã duyệt", "Chờ duyệt", "Bị từ chối"],
                    datasets: [
                      {
                        label: "Số lượng",
                        data: [
                          jobStatusCount.APPROVED,
                          jobStatusCount.PENDING,
                          jobStatusCount.REJECTED || 0,
                        ],
                        backgroundColor: ["#007aff", "#ff9f0a", "#ff3b30"],
                        borderRadius: 12,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </Card>
          </Col>

          {/* Company Approval */}
          <Col xs={24} lg={12}>
            <Card title="Tỷ lệ duyệt công ty" className="chart-card">
              <div className="chart-container">
                <Pie
                  data={{
                    labels: ["Đã duyệt", "Chờ duyệt"],
                    datasets: [
                      {
                        data: [
                          companyStatusCount.APPROVED,
                          companyStatusCount.PENDING,
                        ],
                        backgroundColor: ["#007aff", "#ff2d55"],
                        borderColor: "#fff",
                        borderWidth: 4,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
            </Card>
          </Col>

          {/* CV Trend */}
          <Col span={24}>
            <Card
              title={`Xu hướng nộp CV năm ${selectedYear}`}
              className="chart-card full-width"
            >
              <div className="chart-container line-chart">
                <Line
                  data={{
                    labels: cvByMonth.labels,
                    datasets: [
                      {
                        label: "Số CV",
                        data: cvByMonth.data,
                        borderColor: "#5856d6",
                        backgroundColor: "rgba(88, 86, 214, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: "#5856d6",
                      },
                    ],
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0,0,0,0.05)" },
                      },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminSection>
  );
}

export default AdminPage;


import React, { useEffect, useState, useMemo } from "react";
import AdminSection from "../../components/Admin/AdminSection";
import { jobAPI, companyAPI, cvAPI } from "../../services/auth.services";
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
import { Card, Row, Col, Spin, Select, Statistic, Skeleton } from "antd";
import { SolutionOutlined, BankOutlined, FileTextOutlined } from "@ant-design/icons";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function AdminPage() {
  const [jobStats, setJobStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [cvStats, setCvStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([jobAPI.getAllJobs(), companyAPI.getAll(), cvAPI.getMyCVs()])
      .then(([jobsRes, companiesRes, cvsRes]) => {
        setJobStats(jobsRes.data);
        setCompanyStats(companiesRes.data);
        setCvStats(cvsRes.data);
      })
      .catch(() => message.error("Không thể tải dữ liệu!"))
      .finally(() => setLoading(false));
  }, []);

  const totalJobs = jobStats.length;
  const totalCompanies = companyStats.length;
  const totalCVs = cvStats.length;

  const jobStatusCount = useMemo(() => {
    return jobStats.reduce((acc, job) => {
      const key = job.status || (job.approved ? "APPROVED" : "PENDING");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [jobStats]);

  const companyStatusCount = useMemo(() => {
    return companyStats.reduce((acc, company) => {
      const key = company.status || (company.approved ? "APPROVED" : "PENDING");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [companyStats]);

  const cvByMonth = useMemo(() => {
    return cvStats.reduce((acc, cv) => {
      const date = new Date(cv.createdAt);
      if (date.getFullYear() === selectedYear) {
        const month = date.toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});
  }, [cvStats, selectedYear]);

  const years = [...new Set(cvStats.map(cv => new Date(cv.createdAt).getFullYear()))];

  if (loading) {
    return (
      <AdminSection>
        <Skeleton active paragraph={{ rows: 6 }} />
      </AdminSection>
    );
  }

  return (
    <AdminSection>
      <h1 style={{ marginBottom: "20px" }}>📊 Báo cáo thống kê</h1>

      {/* Cards tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={8}>
          <Card hoverable>
            <Statistic title="Tổng số Job" value={totalJobs} prefix={<SolutionOutlined />} valueStyle={{ color: "#1890ff" }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic title="Tổng số Công ty" value={totalCompanies} prefix={<BankOutlined />} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic title="Tổng số CV" value={totalCVs} prefix={<FileTextOutlined />} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc năm */}
      <Row style={{ marginBottom: "20px" }}>
        <Col span={24}>
          <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 200 }}>
            {years.map(year => (
              <Select.Option key={year} value={year}>
                Năm {year}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Thống kê Job theo trạng thái" bordered={false} hoverable>
            <Bar
              data={{
                labels: Object.keys(jobStatusCount),
                datasets: [
                  {
                    label: "Số lượng Job",
                    data: Object.values(jobStatusCount),
                    backgroundColor: ["#1890ff", "#52c41a", "#faad14"],
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Tỷ lệ công ty duyệt vs chưa duyệt" bordered={false} hoverable>
            <Pie
              data={{
                labels: Object.keys(companyStatusCount),
                datasets: [
                  {
                    data: Object.values(companyStatusCount),
                    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title={`Số lượng CV theo tháng (${selectedYear})`} bordered={false} hoverable>
            <Line
              data={{
                labels: Object.keys(cvByMonth),
                datasets: [
                  {
                    label: "CV được tạo",
                    data: Object.values(cvByMonth),
                    borderColor: "#4BC0C0",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    fill: true,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
            />
          </Card>
        </Col>
      </Row>
    </AdminSection>
  );
}

export default AdminPage;

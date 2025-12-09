
// src/pages/HR/HrStatisticsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import HRSection from "../../components/HR/HRSection";
import { jobAPI, applicationAPI } from "../../services/auth.services";
import {
  Card, Row, Col, Select, Statistic, Skeleton, Table,
  Typography, Space, Button, message
} from "antd";
import { SolutionOutlined, TeamOutlined, BarChartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from "chart.js";

import "./HrStatisticsPage.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const { Text } = Typography;

const HrStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [overview, setOverview] = useState({ totalJobs: 0, totalApplicants: 0, avgApplicantsPerJob: 0 });
  const [statusFilter, setStatusFilter] = useState("ALL");

  const token = localStorage.getItem("token"); // theo ManageJobSection.jsx  [1](https://cmcglobalcompany-my.sharepoint.com/personal/nthuy6_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/ManageJobSection.jsx)

  const getApplicantsCountForJob = async (jobId, statusFilter) => {
    try {
      const statusParam = statusFilter === "ALL" ? null : statusFilter; // giống ManageJob  [1](https://cmcglobalcompany-my.sharepoint.com/personal/nthuy6_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/ManageJobSection.jsx)
      const res = await applicationAPI.getByJobId(jobId, 0, 10, statusParam, token);
      const data = res?.data;
      const apps = Array.isArray(data?.content) ? data.content
                  : Array.isArray(data) ? data
                  : [];
      const lengthCount = Array.isArray(apps) ? apps.length : 0;
      const totalCount = Number(data?.totalElements ?? data?.total ?? lengthCount ?? 0);
      return totalCount;
    } catch (e) {
      if (e?.response?.status === 403) {
        console.warn(`403 Forbidden – không có quyền xem ứng viên của job ${jobId}`);
      } else {
        console.error("getByJobId error:", e);
      }
      return 0;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsRes = await jobAPI.getMyCompanyJobs(); // /jobs/my-company  [2](https://cmcglobalcompany-my.sharepoint.com/personal/nthuy6_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/HrStatisticsPage.jsx)
      const rawJobs = Array.isArray(jobsRes?.data) ? jobsRes.data : [];

      const jobWithCounts = await Promise.all(
        rawJobs.map(async (j) => {
          const count = await getApplicantsCountForJob(j.jobId, statusFilter);
          return { ...j, applicantsCount: count ?? 0 };
        })
      );

      setJobs(jobWithCounts);

      const totalJobs = jobWithCounts.length;
      const totalApplicants = jobWithCounts.reduce((sum, j) => sum + (Number(j.applicantsCount) || 0), 0);
      const avgApplicantsPerJob = totalJobs ? Number((totalApplicants / totalJobs).toFixed(2)) : 0;

      setOverview({ totalJobs, totalApplicants, avgApplicantsPerJob });
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu!");
      setJobs([]);
      setOverview({ totalJobs: 0, totalApplicants: 0, avgApplicantsPerJob: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]); // eslint-disable-line

  const columns = [
    {
      title: "Tin tuyển dụng",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (st) => String(st || "").toUpperCase(),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    },
    {
      title: "Số ứng viên",
      dataIndex: "applicantsCount",
      key: "applicantsCount",
      width: 140,
      align: "right",
      sorter: (a, b) => (a.applicantsCount || 0) - (b.applicantsCount || 0),
      render: (val) => Number(val || 0),
    },
  ];

  const chartData = useMemo(() => {
    const labels = jobs.map((j) => j.title);
    const data = jobs.map((j) => Number(j.applicantsCount || 0));
    return {
      labels,
      datasets: [{ label: "Số ứng viên", data, backgroundColor: "#1677ff", borderRadius: 12, maxBarThickness: 54 }],
    };
  }, [jobs]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { padding: 20 } }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { callback: function (val) { const label = this.getLabelForValue(val); return label?.length > 24 ? label.slice(0, 24) + "…" : label; } } },
      y: { beginAtZero: true, precision: 0 },
    },
    animation: { duration: 800 },
  };

  const exportCSV = () => {
    const header = ["jobId", "title", "status", "createdAt", "applicantsCount"];
    const rows = jobs.map((j) => [
      j.jobId,
      `"${(j.title || "").replace(/"/g, '""')}"`,
      String(j.status || "").toUpperCase(),
      dayjs(j.createdAt).format("YYYY-MM-DD"),
      Number(j.applicantsCount || 0),
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hr_recruitment_stats_${dayjs().format("YYYYMMDD_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <HRSection>
        <div className="hr-loading-wrapper"><Skeleton active paragraph={{ rows: 10 }} /></div>
      </HRSection>
    );
  }

  return (
    <HRSection>
      <div className="hr-dashboard">
        <div className="hr-dashboard-title">
          <h1>Thống kê tuyển dụng (HR)</h1>
          <p>Theo dõi số lượng ứng viên theo từng tin tuyển dụng</p>
        </div>

        <Row gutter={[24, 24]} className="hr-stats-grid">
          <Col xs={24} sm={12} lg={8}>
            <div className="hr-stat-card">
              <SolutionOutlined className="hr-stat-icon job" />
              <Statistic title="Tổng số tin" value={overview.totalJobs} valueStyle={{ color: "#007aff" }} />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="hr-stat-card">
              <TeamOutlined className="hr-stat-icon company" />
              <Statistic title="Tổng ứng viên" value={overview.totalApplicants} valueStyle={{ color: "#34c759" }} />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="hr-stat-card">
              <BarChartOutlined className="hr-stat-icon cv" />
              <Statistic title="Trung bình/ tin" value={overview.avgApplicantsPerJob} valueStyle={{ color: "#ff9f0a" }} />
            </div>
          </Col>
        </Row>

        <Card className="hr-chart-card" title="Bộ lọc">
          <Row align="middle" justify="space-between">
            <Space>
              <Text style={{ marginRight: 12 }}>Trạng thái ứng tuyển:</Text>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "Tất cả", value: "ALL" },
                  { label: "PENDING", value: "PENDING" },
                  { label: "APPROVED", value: "APPROVED" },
                  { label: "REJECTED", value: "REJECTED" },
                ]}
              />
            </Space>
            <Space>
              <Button onClick={fetchData}>Tải lại</Button>
              <Button onClick={exportCSV} disabled={!jobs.length}>Xuất CSV</Button>
            </Space>
          </Row>
        </Card>

        <Card className="hr-chart-card" title="Danh sách tin tuyển dụng">
          <Table
            rowKey={(row) => row.jobId ?? row.id}
            dataSource={jobs}
            columns={columns}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>

        <Card className="hr-chart-card" title="Biểu đồ số ứng viên theo từng tin">
          <div className="hr-chart-container" style={{ height: 380 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </Card>
      </div>
    </HRSection>
  );
};

export default HrStatisticsPage;

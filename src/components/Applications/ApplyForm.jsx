
import React, { useEffect, useState } from "react";
import { cvAPI, applicationAPI } from "../../services/auth.services";
import {
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert
} from "@mui/material";
import "./ApplyForm.css";
import { toast } from "react-toastify";

const ApplyForm = ({ jobId, jobTitle, onClose }) => {
  const [cvs, setCvs] = useState([]);
  const [selectedOption, setSelectedOption] = useState("recent");
  const [selectedCv, setSelectedCv] = useState("");
  const [notes, setNotes] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    cvAPI
      .getMyCVs()
      .then((res) => setCvs(res.data))
      .catch((err) => console.error("Lỗi khi tải CV:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCv && selectedOption === "other") {
      toast.error("Vui lòng chọn CV");
      return;
    }

    const data = { jobId, cvId: selectedCv || cvs[0]?.id, notes };

    try {
      await applicationAPI.create(data, token);
      toast.success("Ứng tuyển thành công!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi ứng tuyển");
    }
  };

  return (
    <div className="apply-form-container">
      <div className="apply-form">
        <Typography variant="h6" className="apply-title">
          Ứng tuyển <span className="highlight">{jobTitle}</span>
        </Typography>

        <Typography className="section-title">Chọn CV để ứng tuyển</Typography>
        <RadioGroup
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <FormControlLabel
            value="recent"
            control={
              <Radio
                sx={{
                  color: "#00b14f",
                  "&.Mui-checked": { color: "#00b14f" }
                }}
              />
            }
            label={`CV ứng tuyển gần nhất: ${cvs[0]?.title || "Chưa có CV"}`}
            sx={{
              color: selectedOption === "recent" ? "#00b14f" : "inherit",
              fontWeight: selectedOption === "recent" ? "bold" : "normal"
            }}
          />
          <FormControlLabel
            value="other"
            control={
              <Radio
                sx={{
                  color: "#00b14f",
                  "&.Mui-checked": { color: "#00b14f" }
                }}
              />
            }
            label="Chọn CV khác trong thư viện CV của tôi"
            sx={{
              color: selectedOption === "other" ? "#00b14f" : "inherit",
              fontWeight: selectedOption === "other" ? "bold" : "normal"
            }}
          />
        </RadioGroup>

        {selectedOption === "other" && (
          <TextField
            select
            fullWidth
            value={selectedCv}
            onChange={(e) => setSelectedCv(e.target.value)}
            className="cv-select"
            SelectProps={{ native: true }}
          >
            <option value="">-- Chọn CV --</option>
            {cvs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.title}
              </option>
            ))}
          </TextField>
        )}

        <Divider className="divider" />

        <Typography className="section-title">Thư giới thiệu:</Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="Viết giới thiệu ngắn gọn về bản thân..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Alert severity="warning" className="alert">
          <strong>Lưu ý:</strong> Hãy luôn cẩn trọng trong quá trình tìm việc...
        </Alert>

        <div className="action-buttons">
         
<Button
  variant="outlined"
  onClick={onClose}
  className="cancel-btn"
>
  Hủy
</Button>

          <Button variant="contained" sx={{ backgroundColor: "#00b14f" }} onClick={handleSubmit}>
            Nộp hồ sơ ứng tuyển
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplyForm;

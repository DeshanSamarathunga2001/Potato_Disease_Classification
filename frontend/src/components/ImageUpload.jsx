import { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import {
  Clear,
  CheckCircle,
  CloudUpload,
  LocalFlorist,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './ImageUpload.css';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendFile = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setData(res.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error analyzing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
    },
    maxFiles: 1,
    maxSize: 5000000,
  });

  const clearData = () => {
    setData(null);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (preview && selectedFile) {
      sendFile();
    }
  }, [preview, selectedFile, sendFile]);

  const confidence = data
    ? (parseFloat(data.confidence) * 100).toFixed(2)
    : 0;

  return (
    <Box className="app-root">
      <AppBar position="static" className="app-bar" elevation={0}>
        <Toolbar>
          <LocalFlorist sx={{ mr: 2, fontSize: 32 }} />
          <Box>
            <Typography variant="h6" className="app-title">
              Potato Disease Detection
            </Typography>
            <Typography variant="caption" className="app-subtitle">
              AI-Powered Agricultural Health Monitoring
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className="main-container">
        <Box className="header-section">
          <Typography variant="h3" className="header-title">
            Identify Potato Plant Diseases
          </Typography>
          <Typography variant="body1" className="header-desc">
            Upload an image of a potato leaf and our AI will analyze it to
            detect Early Blight, Late Blight, or confirm if it's healthy
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card className="image-card">
              {!preview && !isLoading && (
                <CardContent className="dropzone-container">
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <CloudUpload className="upload-icon" />
                    <Typography variant="h6" className="dropzone-text">
                      {isDragActive
                        ? 'Drop the image here'
                        : 'Drag & drop a potato leaf image here'}
                    </Typography>
                    <Typography variant="body2" className="dropzone-subtext">
                      or click to browse (Max 5MB)
                    </Typography>
                  </div>
                </CardContent>
              )}

              {preview && !isLoading && (
                <Box className="image-preview">
                  <img src={preview} alt="Uploaded leaf" />
                </Box>
              )}

              {isLoading && (
                <CardContent className="loading-container">
                  <CircularProgress size={60} thickness={4} className="loader" />
                  <Typography variant="h6" className="loading-text">
                    Analyzing your image...
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>

          {data && !isLoading && (
            <Grid item xs={12}>
              <Paper className="results-card" elevation={3}>
                <Box className="result-header">
                  <CheckCircle className="icon-success" />
                  <Typography variant="h5" className="result-title">
                    Analysis Complete
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box className="result-box">
                      <Typography variant="subtitle2" className="result-label">
                        Detected Disease
                      </Typography>
                      <Box className="class-label">{data.class}</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="result-box">
                      <Typography variant="subtitle2" className="result-label">
                        Confidence Level
                      </Typography>
                      <Box className="confidence-badge">{confidence}%</Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box className="button-container">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={clearData}
                    startIcon={<Clear />}
                    className="clear-button"
                  >
                    Analyze Another Image
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default ImageUpload;
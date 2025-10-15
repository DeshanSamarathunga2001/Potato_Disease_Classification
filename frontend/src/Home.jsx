import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ✅ Material-UI imports
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { DropzoneArea } from "material-ui-dropzone";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import ClearIcon from "@material-ui/icons/Clear";

// 🌿 Styles (modern agri-themed)
const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, rgba(232,245,233,1) 0%, rgba(200,230,201,1) 100%)",
    paddingBottom: theme.spacing(5),
  },
  appbar: {
    background:
      "linear-gradient(90deg, rgba(46,125,50,1) 0%, rgba(56,142,60,1) 100%)",
    boxShadow: "0px 4px 20px rgba(46,125,50,0.3)",
  },
  title: {
    fontWeight: 700,
  },
  card: {
    borderRadius: 16,
    boxShadow:
      "0 10px 30px rgba(46,125,50,0.08), 0 6px 12px rgba(0,0,0,0.04)",
  },
  media: {
    height: 300,
    objectFit: "cover",
  },
  dropzone: {
    marginTop: theme.spacing(2),
    borderRadius: 16,
    backgroundColor: "#f1f8e9",
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  resultPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(46,125,50,0.12)",
    border: "1px solid rgba(46,125,50,0.25)",
    fontWeight: 600,
    marginRight: 8,
  },
  confPill: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#f7faf7",
    fontWeight: 600,
  },
  actions: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
}));

const ColorButton = withStyles(() => ({
  root: {
    borderRadius: 12,
    padding: "10px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
}))(Button);

// ✅ Reads from your backend URL (set in .env)
const API_URL = process.env.REACT_APP_API_URL;

export default function Home() {
  const classes = useStyles();

  // States (same as your old code)
  const [selectedFile, setSelectedFile] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsloading] = useState(false);
  const [data, setData] = useState(null);

  // Handle dropzone file select
  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    setSelectedFile(files[0]);
  };

  // Generate preview URL
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      setImage(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setImage(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Send file to backend
  const sendFile = useCallback(async () => {
    if (image && selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await axios.post(API_URL, formData);
        if (res.status === 200) setData(res.data);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setIsloading(false);
      }
    }
  }, [image, selectedFile]);

  // Trigger prediction when preview is ready
  useEffect(() => {
    if (!preview) return;
    setIsloading(true);
    sendFile();
  }, [preview, sendFile]);

  // Reset everything
  const clearAll = () => {
    setSelectedFile(null);
    setImage(null);
    setPreview(null);
    setData(null);
  };

  return (
    <div className={classes.root}>
      {/* ✅ Header */}
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            🌱 Potato Disease Classifier
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ✅ Main Content */}
      <Container maxWidth="md" style={{ marginTop: 40 }}>
        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Upload Image
                </Typography>
                <DropzoneArea
                  acceptedFiles={["image/*"]}
                  dropzoneText={"Drag and drop an image of a potato leaf"}
                  onChange={onSelectFile}
                  filesLimit={1}
                  maxFileSize={5000000}
                  showPreviewsInDropzone={false}
                  showAlerts={false}
                  className={classes.dropzone}
                />
                <div className={classes.actions}>
                  <ColorButton
                    variant="contained"
                    color="primary"
                    onClick={clearAll}
                    startIcon={<ClearIcon />}
                  >
                    Analyze Another Image
                  </ColorButton>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Preview + Result */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  component="img"
                  image={
                    preview ||
                    "https://via.placeholder.com/600x300?text=Your+leaf+preview"
                  }
                  title="Preview"
                />
              </CardActionArea>
              <CardContent>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Result
                </Typography>

                {isLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <CircularProgress size={22} />
                    <Typography variant="body1">Analyzing...</Typography>
                  </div>
                )}

                {!isLoading && data && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={classes.resultPill}>
                      <CheckIcon /> {data.class}
                    </span>
                    <span className={classes.confPill}>
                      Confidence: {(data.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                )}

                {!isLoading && !data && !preview && (
                  <Typography variant="body2" color="textSecondary">
                    Upload an image to start analysis.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

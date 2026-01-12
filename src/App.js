import { useState, useRef, useEffect } from "react";
import wslink from "./wslink";
import "./App.css";
import {
  Box,
  AppBar,
  Toolbar,
  LinearProgress,
  Button,
  Menu,
  MenuItem
} from "@mui/material";
import RemoteRenderView from "./RemoteRenderingView";

const TOPIC = "mpr.channel";

function App() {
  const context = useRef({});
  const [client, setClient] = useState(null);
  const [busy, setBusy] = useState(0);
  const [crosslinePositions, setCrosslinePositions] = useState(null);

  // --- Giữ nguyên các State điều khiển Menu ---
  const [anchorElRotate, setAnchorElRotate] = useState(null);
  const openRotate = Boolean(anchorElRotate);
  const handleClickRotate = (event) => { setAnchorElRotate(event.currentTarget); };
  const handleCloseRotate = () => { setAnchorElRotate(null); };

  const [anchorElMeasurement, setAnchorElMeasurement] = useState(null);
  const openMeasurement = Boolean(anchorElMeasurement);
  const handleClickMeasurement = (event) => { setAnchorElMeasurement(event.currentTarget); };
  const handleCloseMeasurement = () => { setAnchorElMeasurement(null); };

  const [anchorElPreset, setAnchorElPreset] = useState(null);
  const openPreset = Boolean(anchorElPreset);
  const handleClickPreset = (event) => { setAnchorElPreset(event.currentTarget); };
  const handleClosePreset = () => { setAnchorElPreset(null); };

  // Giữ lại UID làm định danh nội bộ cho PoC, bỏ Store URL/Auth
  const studyUID = "poc-study-001";
  const seriesUID = "poc-series-001";

  useEffect(() => {
    // Chỉ kết nối tới server Python local, không truyền tham số Orthanc
    const wsURL = "ws://localhost:1234/ws";
    console.log(`Kết nối tới PoC Server: ${wsURL}`);

    if (wsURL) {
      wslink.connect(context.current, setClient, setBusy, wsURL);
    }
  }, []);

  useEffect(() => {
    if (client) {
      const session = client.getConnection().getSession();
      session.subscribe(TOPIC, ([msg]) => {
        setCrosslinePositions(msg);
      });
    }
  }, [client]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <Button variant="outlined" size="small" onClick={() => wslink.create(context.current, studyUID, seriesUID)}>Create</Button>

          <Button
            id="basic-button"
            aria-controls={openRotate ? 'grouped-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openRotate ? 'true' : undefined}
            variant="outlined"
            size="small"
            onClick={handleClickRotate}
          >Rotate</Button>
          <Menu
            id="grouped-menu"
            anchorEl={anchorElRotate}
            open={openRotate}
            onClose={handleCloseRotate}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => {
              wslink.activeRotate(context.current);
              handleCloseRotate();
            }}>Rotate</MenuItem>
            <MenuItem onClick={() => {
              wslink.changeViewingAngle(context.current, "ANTERIOR");
              handleCloseRotate();
            }}>ANTERIOR</MenuItem>
            <MenuItem onClick={() => {
              wslink.changeViewingAngle(context.current, "POSTERIOR");
              handleCloseRotate();
            }}>POSTERIOR</MenuItem>
            <MenuItem onClick={() => {
              wslink.changeViewingAngle(context.current, "LEFT");
              handleCloseRotate();
            }}>LEFT</MenuItem>
            <MenuItem onClick={() => {
              wslink.changeViewingAngle(context.current, "RIGHT");
              handleCloseRotate();
            }}>RIGHT</MenuItem>
            <MenuItem onClick={() => {
              wslink.changeViewingAngle(context.current, "SUPERIOR");
              handleCloseRotate();
            }}>SUPERIOR</MenuItem>
            <MenuItem onClick={() => {
              wslink.changeViewingAngle(context.current, "INFERIOR");
              handleCloseRotate();
            }}>INFERIOR</MenuItem>
          </Menu>

          <Button variant="outlined" size="small" onClick={() => wslink.activePan(context.current)}>Pan</Button>
          <Button variant="outlined" size="small" onClick={() => wslink.activeZoom(context.current)}>Zoom</Button>
          <Button variant="outlined" size="small" onClick={() => wslink.activeWL(context.current)}>WL</Button>

          <Button
            id="basic-button"
            aria-controls={openMeasurement ? 'grouped-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMeasurement ? 'true' : undefined}
            variant="outlined"
            size="small"
            onClick={handleClickMeasurement}
          >Measurement</Button>
          <Menu
            id="grouped-menu"
            anchorEl={anchorElMeasurement}
            open={openMeasurement}
            onClose={handleCloseMeasurement}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => {
              wslink.activeLength(context.current);
              handleCloseMeasurement();
            }}>Length</MenuItem>
            <MenuItem onClick={() => {
              wslink.activeAngle(context.current);
              handleCloseMeasurement();
            }}>Angle</MenuItem>
            <MenuItem onClick={() => {
              wslink.deleteAnnotations(context.current);
              handleCloseMeasurement();
            }}>Delete</MenuItem>
          </Menu>

          <Button
            id="basic-button"
            aria-controls={openPreset ? 'grouped-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openPreset ? 'true' : undefined}
            variant="outlined"
            size="small"
            onClick={handleClickPreset}
          >Preset</Button>
          <Menu
            id="grouped-menu"
            anchorEl={anchorElPreset}
            open={openPreset}
            onClose={handleClosePreset}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => {
              wslink.applyVolumePreset(context.current, "CT-AAA");
              handleClosePreset();
            }}>CT-AAA</MenuItem>
            <MenuItem onClick={() => {
              wslink.applyVolumePreset(context.current, "CT-Bone");
              handleClosePreset();
            }}>CT-Bone</MenuItem>
            <MenuItem onClick={() => {
              wslink.applyVolumePreset(context.current, "CT-MIP");
              handleClosePreset();
            }}>CT-MIP</MenuItem>
          </Menu>

          <Button variant="outlined" size="small" onClick={() => wslink.activeCropByBox(context.current)}>CropByBox</Button>
          <Button variant="outlined" size="small" onClick={() => wslink.activeCropFreehand(context.current, "INSIDE")}>CropFreehand</Button>
          <Button variant="outlined" size="small" onClick={() => wslink.cropBed(context.current)}>CropBed</Button>
          <Button variant="outlined" size="small" onClick={() => wslink.reset(context.current)}>Reset</Button>
        </Toolbar>
        <LinearProgress sx={{ opacity: !!busy ? 1 : 0 }} />
      </AppBar>
      <Box className="appContent">
        <div className="views">
          <div style={{ position: "relative", width: "600px", height: "600px", border: "0.5px groove white" }}>
            <RemoteRenderView client={client} viewId="1" crosslineColor={null} crosslinePositions={null} />
          </div>
          <div style={{ position: "relative", width: "300px", height: "300px", border: "0.5px groove white" }}>
            <RemoteRenderView client={client} viewId="2" crosslineColor={["green", "blue"]} crosslinePositions={crosslinePositions} />
          </div>
          <div style={{ position: "relative", width: "300px", height: "300px", border: "0.5px groove white" }}>
            <RemoteRenderView client={client} viewId="3" crosslineColor={["green", "red"]} crosslinePositions={crosslinePositions} />
          </div>
          <div style={{ position: "relative", width: "300px", height: "300px", border: "0.5px groove white" }}>
            <RemoteRenderView client={client} viewId="4" crosslineColor={["blue", "red"]} crosslinePositions={crosslinePositions} />
          </div>
        </div>
      </Box>
    </Box>
  );
}

export default App;
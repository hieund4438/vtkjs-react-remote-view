import vtkWSLinkClient from "vtk.js/Sources/IO/Core/WSLinkClient";
import SmartConnect from "wslink/src/SmartConnect";
import { connectImageStream } from "vtk.js/Sources/Rendering/Misc/RemoteView";

vtkWSLinkClient.setSmartConnectClass(SmartConnect);

const wslink = {
  connect: (context, setClient, setBusy, sessionURL) => {
    // Initiate network connection
    const config = {
      sessionURL: sessionURL
    };

    const client = context.client;
    if (client && client.isConnected()) {
      client.disconnect(-1);
    }
    let clientToConnect = client;
    if (!clientToConnect) {
      clientToConnect = vtkWSLinkClient.newInstance();
    }

    // Connect to busy store
    clientToConnect.onBusyChange((busy) => {
      setBusy(busy);
    });
    // Virtually increase work load to maybe keep isBusy() on while executing a synchronous task.
    clientToConnect.beginBusy();

    // Error
    clientToConnect.onConnectionError((httpReq) => {
      const message = (httpReq && httpReq.response && httpReq.response.error) || `Connection error`;
      console.error(message);
      console.log(httpReq);
    });

    // Close
    clientToConnect.onConnectionClose((httpReq) => {
      const message = (httpReq && httpReq.response && httpReq.response.error) || `Connection close`;
      console.error(message);
      console.log(httpReq);
    });

    // Connect
    clientToConnect.connect(config).then((validClient) => {
      const session = validClient.getConnection().getSession();
      connectImageStream(session);
      context.client = validClient;
      setClient(context.client);
      clientToConnect.endBusy();
    }).catch((error) => {
      console.error(error);
    });
  },

  create: (context, studyUID, seriesUID) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("dicom.download", [studyUID, seriesUID]);
      session.subscribe("wslink.channel", ([msg]) => {
        console.log(`progress: ${msg.progress}`);
        if (msg.progress === 100) {
          const option = "VOLUME_AND_MPR";
          session.call("volume.create", [option]);
        }
      });
    }
  },

  activeRotate: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.rotate", []);
    }
  },

  activePan: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.pan", []);
    }
  },

  activeZoom: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.zoom", []);
    }
  },

  activeWL: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.shift", []);
    }
  },

  setShade: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call('volume.shade', []);
    }
  },

  activeLength: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.length", []);
    }
  },

  activeAngle: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.angle", []);
    }
  },

  deleteAnnotations: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call('volume.delete', []);
    }
  },

  applyVolumePreset: (context, presetName) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call('volume.preset', [presetName]);
    }
  },

  activeCropByBox: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.crop", []);
    }
  },

  activeCropFreehand: (context, option) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.crop.freehand", [option]);
    }
  },

  cropBed: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.remove.bed", []);
    }
  },

  changeViewingAngle: (context, viewingAngle) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.view.plane", [viewingAngle]);
    }
  },

  sliceOn3DViewport: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("volume.slice", ["AXIAL"])
    }
  },

  reset: (context) => {
    if (context.client) {
      const session = context.client.getConnection().getSession();
      session.call("reset", []);
    }
  }
};

export default wslink;

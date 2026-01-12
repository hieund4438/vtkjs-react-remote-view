import React, { useEffect, useRef } from 'react';
import './RemoteRenderingView.css';
import vtkRemoteView from '@kitware/vtk.js/Rendering/Misc/RemoteView';

const RemoteRenderView = ({
    viewId = '-1',
    client = null,
    crosslineColor = null,
    crosslinePositions = null
  }) => {
  const viewRef = useRef(null);
  const view = useRef(null);

  useEffect(() => {
    if (crosslinePositions === null) {
      return;
    }

    const size = view.current.getCanvasView().getSize();
    const canvas = viewRef.current.querySelector("canvas");
    let x, y;
    // Axial
    if (viewId === '2' && crosslinePositions.axial !== undefined) {
      canvas.width = size[0];
      canvas.height = size[1];
      x = crosslinePositions.axial[0];
      y = crosslinePositions.axial[1];
    }
    // Coronal
    else if (viewId === '3' && crosslinePositions.coronal !== undefined) {
      canvas.width = size[0];
      canvas.height = size[1];
      x = crosslinePositions.coronal[0];
      y = crosslinePositions.coronal[1];
    }
    // Sagital
    else if (viewId === '4' && crosslinePositions.sagital !== undefined) {
      canvas.width = size[0];
      canvas.height = size[1];
      x = crosslinePositions.sagital[0];
      y = crosslinePositions.sagital[1];
    }
    else {
      return;
    }
    drawCrossline(x, y);
  }, [crosslinePositions]);
  
  useEffect(() => {
    view.current = vtkRemoteView.newInstance({
      rpcWheelEvent: "viewport.mouse.zoom.wheel",
    });
    // Default of 0.5 causes 2x size labels on high-DPI screens. 1 good for demo, not for production.
    view.current.setInteractiveRatio(1);
    view.current.setContainer(viewRef.current);
    window.addEventListener("resize", () => {
      view.current.resize();

      if (crosslineColor === null) {
        return;
      }

      const canvas = viewRef.current.querySelector("canvas");
      const size = view.current.getCanvasView().getSize();
      canvas.width = size[0];
      canvas.height = size[1];
      const x = Math.floor(canvas.width / 2);
      const y = Math.floor(canvas.height / 2);
      drawCrossline(x, y);
    });

    if (client) { // vtkWSLinkClient
      const session = client.getConnection().getSession();
      // console.log("connection: ", client.getConnection());
      // console.log("session: ", session);
      // session.call("test").then((value) => {
      //   console.log("value: ", value);
      // })
      view.current.setSession(session);
      view.current.setViewId(viewId);
      view.current.render();

      if (crosslineColor === null) {
        return;
      }
      
      // const canvas = viewRef.current.querySelector("canvas");
      const canvas = view.current.getContainer().querySelector("canvas");
      canvas.addEventListener("mousedown", mouseDownHandle);
      canvas.addEventListener("mouseup", mouseUpHandle);
      const size = view.current.getCanvasView().getSize();
      canvas.width = size[0];
      canvas.height = size[1];
      const x = Math.floor(canvas.width / 2);
      const y = Math.floor(canvas.width / 2);
      drawCrossline(x, y);
    }
  }, [client, viewId]);

  const drawCrossline = (x, y) => {
    const canvas = viewRef.current.querySelector("canvas");
    const context = canvas.getContext("2d");
    context.lineWidth = 2;

    context.beginPath();
    context.strokeStyle = crosslineColor[1];
    context.moveTo(0, y);
    context.lineTo(x - 20, y);
    context.stroke();

    context.beginPath();
    context.strokeStyle = crosslineColor[1];
    context.moveTo(x + 20, y);
    context.lineTo(canvas.width, y);
    context.stroke();

    context.beginPath();
    context.strokeStyle = crosslineColor[0];
    context.moveTo(x, 0);
    context.lineTo(x, y - 20);
    context.stroke();

    context.beginPath();
    context.strokeStyle = crosslineColor[0];
    context.moveTo(x, y + 20);
    context.lineTo(x, canvas.height);
    context.closePath();
    context.stroke();
  }

  const mouseDownHandle = (event) => {
    const size = view.current.getCanvasView().getSize();
    const canvas = viewRef.current.querySelector("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    drawCrossline(x, y);
    canvas.addEventListener("mousemove", mouseMoveHandle);
  }

  const mouseMoveHandle = (event) => {
    const size = view.current.getCanvasView().getSize();
    const canvas = viewRef.current.querySelector("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    drawCrossline(x, y);
  }

  const mouseUpHandle = (event) => {
    const canvas = viewRef.current.querySelector("canvas");
    canvas.removeEventListener("mousemove", mouseMoveHandle);
  }

  return (
    <div ref={viewRef} className="container"></div>
  );
};

export default RemoteRenderView;

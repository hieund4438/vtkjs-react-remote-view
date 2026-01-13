import React, { useEffect, useRef } from 'react';
import './RemoteRenderingView.css';
import vtkRemoteView from '@kitware/vtk.js/Rendering/Misc/RemoteView';

const RemoteRenderView = ({
  viewId = '-1',
  client = null,
}) => {
  const viewRef = useRef(null);
  const view = useRef(null);

  useEffect(() => {
    if (!viewRef.current || !client) {
      return;
    }

    const session = client.getConnection().getSession();
    const container = viewRef.current;

    // Cấu hình View ban đầu
    const viewOptions = {
      rpcWheelEvent: "viewport.mouse.zoom.wheel",
      rpcMouseEvent: "viewport.mouse.interaction"
    };



    view.current = vtkRemoteView.newInstance(viewOptions);
    view.current.setInteractiveRatio(1);
    view.current.setContainer(container);
    view.current.setSession(session);
    view.current.setViewId(viewId);
    view.current.render();

    const handleResize = () => {
      view.current.resize();
    };
    window.addEventListener("resize", handleResize);



    return () => {
      window.removeEventListener("resize", handleResize);
      if (view.current) {
        view.current.delete();
      }
    };
  }, [client, viewId]);

  return (
    <div
      ref={viewRef}
      className="container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  );
};

export default RemoteRenderView;
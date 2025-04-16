import { useState, useRef, useEffect } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkResliceCursorWidget from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget';
import { xyzToViewType } from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget/Constants';
import { CaptureOn } from '@kitware/vtk.js/Widgets/Core/WidgetManager/Constants';
import vtkLineSource from '@kitware/vtk.js/Filters/Sources/LineSource';

const appCursorStyles = {
    translateCenter: 'move',
    rotateLine: 'alias',
    translateAxis: 'pointer',
    default: 'default',
};

function createLine(point1, point2, color = [1, 0, 0]) {
    const lineSource = vtkLineSource.newInstance({
        point1,
        point2
    });

    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(lineSource.getOutputPort());
  
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().setColor(...color); // RGB color
  
    return actor;
}

function ClientRenderingView() {
    const vtkContainerRef = useRef(null);
    const context = useRef(null);
    const [coneResolution, setConeResolution] = useState(6);
    const [representation, setRepresentation] = useState(2);

    useEffect(() => {
        if (!context.current) {
            const widget = vtkResliceCursorWidget.newInstance();
            const widgetState = widget.getWidgetState();
            widgetState.getStatesWithLabel('sphere').forEach((handle) => handle.setScale1(20));
            widgetState.getStatesWithLabel('line').forEach((state) => state.setScale3(4, 4, 300));
            widgetState.getStatesWithLabel('center').forEach((state) => state.setOpacity(128));

            const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
                rootContainer: vtkContainerRef.current,
            });
            const coneSource = vtkConeSource.newInstance({ height: 1.0 });

            const mapper = vtkMapper.newInstance();
            mapper.setInputConnection(coneSource.getOutputPort());

            const actor = vtkActor.newInstance();
            actor.setMapper(mapper);

            // Create horizontal and vertical lines
            const horizontalLine = createLine([-1, 0, 0], [1, 0, 0], [1, 0, 0]); // Red line
            const verticalLine = createLine([0, -1, 0], [0, 1, 0], [0, 1, 0]);   // Green line

            const renderer = fullScreenRenderer.getRenderer();
            renderer.addActor(actor);
            renderer.addActor(horizontalLine);
            renderer.addActor(verticalLine);
            renderer.resetCamera();

            const widgetManager = vtkWidgetManager.newInstance();
            widgetManager.setRenderer(renderer);
            widgetManager.enablePicking();
            widgetManager.setCaptureOn(CaptureOn.MOUSE_MOVE);
            const widgetInstance = widgetManager.addWidget(widget, xyzToViewType[0]);
            widgetInstance.setScaleInPixels(true);
            widgetInstance.setHoleWidth(50);
            widgetInstance.setInfiniteLine(true);
            widgetInstance.setKeepOrthogonality(false);
            widgetInstance.setCursorStyles(appCursorStyles);

            const renderWindow = fullScreenRenderer.getRenderWindow();
            renderWindow.render();

            context.current = {
                fullScreenRenderer,
                renderWindow,
                renderer,
                coneSource,
                actor,
                mapper,
            };
        }

        return () => {
            if (context.current) {
                const { fullScreenRenderer, coneSource, actor, mapper } = context.current;
                actor.delete();
                mapper.delete();
                coneSource.delete();
                fullScreenRenderer.delete();
                context.current = null;
            }
        };
    }, [vtkContainerRef]);

    useEffect(() => {
        if (context.current) {
            const { coneSource, renderWindow } = context.current;
            coneSource.setResolution(coneResolution);
            renderWindow.render();
        }
    }, [coneResolution]);

    useEffect(() => {
        if (context.current) {
            const { actor, renderWindow } = context.current;
            actor.getProperty().setRepresentation(representation);
            renderWindow.render();
        }
    }, [representation]);

    return (
        <div>
            <div ref={vtkContainerRef} />
            <table
                style={{
                    position: 'absolute',
                    top: '25px',
                    left: '25px',
                    background: 'white',
                    padding: '12px',
                }}
            >
                <tbody>
                    <tr>
                        <td>
                            <select
                                value={representation}
                                style={{ width: '100%' }}
                                onInput={(ev) => setRepresentation(Number(ev.target.value))}
                            >
                                <option value="0">Points</option>
                                <option value="1">Wireframe</option>
                                <option value="2">Surface</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input
                                type="range"
                                min="4"
                                max="80"
                                value={coneResolution}
                                onChange={(ev) => setConeResolution(Number(ev.target.value))}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ClientRenderingView;

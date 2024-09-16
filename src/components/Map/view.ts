import PortalItem from "@arcgis/core/portal/PortalItem";
import { mapConfig } from "../../config";
import state from "../../stores/state";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { getMapCenterFromHashParams, setMapCenterToHashParams } from "../../utils/URLHashParams";
let view: __esri.MapView = null;

const listeners: IHandle[] = [];

export function getView() {
    return view;
}

export function destroyView() {
    if (view) {
        listeners.forEach(listener => listener.remove());
        view.destroy();
        view = null;
    }
}

export const initializeView = async (divRef: HTMLDivElement) => {
    try {
        const portalItem = new PortalItem({
            id: mapConfig['web-map-id']
        });

        await portalItem.load();
        const webmap = new WebMap({
            portalItem: portalItem
        });
        await webmap.load();
        view = new MapView({
            container: divRef,
            map: webmap as WebMap,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false
                },
                highlightEnabled: false,
                defaultPopupTemplateEnabled: false
            }
        });

        (window as any).view = view;

        await view.when(async () => {
            initializeViewEventListeners();
            state.setViewLoaded();
            const mapCenter = getMapCenterFromHashParams();
            if (mapCenter) {
                view.goTo({ zoom: mapCenter.zoom, center: [mapCenter.center.lon, mapCenter.center.lat] });
            }
        });
    } catch (error) {
        const { name, message } = error;
        state.setError({ name, message });
    }
};

const initializeViewEventListeners = () => {
    const listener = reactiveUtils.when(
        () => view.stationary,
        () => {
            const lon = +view.center.longitude.toFixed(3);
            const lat = +view.center.latitude.toFixed(3);
            const zoom = view.zoom;
            setMapCenterToHashParams({ lon, lat }, zoom);
        }
    );
    listeners.push(listener);
}
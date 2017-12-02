// @flow

const {DEMData} = require('../data/dem_data');
const {serialize} = require('../util/web_worker_transfer');

import type Actor from '../util/actor';
import type {
    WorkerDEMTileParameters,
    WorkerDEMTileCallback,
    TileParameters
} from './worker_source';


class RasterDEMTileWorkerSource {
    actor: Actor;
    loading: {[string]: {[string]: DEMData}};
    loaded: {[string]: {[string]: DEMData}};

    constructor() {
        this.loading = {};
        this.loaded = {};
    }

    loadTile(params: WorkerDEMTileParameters, callback: WorkerDEMTileCallback) {
        const source = params.source,
            uid = params.uid;

        if (!this.loading[source])
            this.loading[source] = {};

        const dem = new DEMData(uid);
        this.loading[source][uid] = dem;
        dem.loadFromImage(params.rawImageData);
        const transferrables = [];
        delete this.loading[source][uid];

        this.loaded[source] = this.loaded[source] || {};
        this.loaded[source][uid] = dem;
        callback(null, serialize(dem, transferrables), transferrables);
    }

    removeTile(params: TileParameters) {
        const loaded = this.loaded[params.source],
            uid = params.uid;
        if (loaded && loaded[uid]) {
            delete loaded[uid];
        }
    }
}

module.exports = RasterDEMTileWorkerSource;

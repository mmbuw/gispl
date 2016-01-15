import {featureFactory} from '../feature';

export default function path(params) {
    let _path = {};

    _path.type = function pathType() {
        return 'Path';
    };

    return _path;
}

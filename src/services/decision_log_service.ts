import {Injector} from "needles/built/src/injector";
import {Deserialize} from "cerialize/dist/serialize";
import {DecisionLog} from "../objects/decision_log";

var json = require('../../test.json');

Injector.provideAsync('decisionLog', function () {
    var log = Deserialize(json, DecisionLog);
    log.entries = log.entries.reverse();
    return Promise.resolve(log);
});
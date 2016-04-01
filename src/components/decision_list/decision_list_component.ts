import {VueApi} from "../../vue_ext/vue_api";
import {VueComponent, data, prop} from "../../vue_ext/vue_ext";
import {DecisionLog} from "../../objects/decision_log";
import {DecisionLogEntry} from "../../objects/decision_log_entry";

@VueComponent('decision-list-component', require('./decision_list_component.haml'))
export  class DecisionListComponent extends  VueApi {

    @prop public decisionLog : DecisionLog;

    constructor() {
        super();
    }

    public select(entry : DecisionLogEntry) : void {
        this.$parent.currentDecisionEntry = entry;
    }
}
import {VueComponent, prop, data, on} from "../../vue_ext/vue_ext";
import {VueApi} from "../../vue_ext/vue_api";
import {DecisionLogEntry} from "../../objects/decision_log_entry";
import {ActionLogEntry} from "../../objects/action_log_entry";

@VueComponent('decision-details-component', require('./decision_details.haml'))
export class DecisionDetailComponent extends VueApi{

    @prop public decision : DecisionLogEntry;

    constructor(){
        super();
    }

    public selectAction(action: ActionLogEntry) : void {
        this.$parent.currentActionEntry = action;
    }

}
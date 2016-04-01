import {VueApi} from "../../vue_ext/vue_api";
import {VueComponent, prop} from "../../vue_ext/vue_ext";
import {ActionLogEntry} from "../../objects/action_log_entry";

@VueComponent('action-details-component', require('./action_details.haml'))
export class ActionDetailComponent extends VueApi{

    @prop public action : ActionLogEntry;
    
}
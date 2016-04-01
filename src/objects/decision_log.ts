import {autoserialize, autoserializeAs} from "cerialize/dist/serialize";
import {DecisionLogEntry} from "./decision_log_entry";

export class DecisionLog {
    @autoserialize public entityName : string;
    @autoserializeAs(DecisionLogEntry) public entries : DecisionLogEntry[];
}
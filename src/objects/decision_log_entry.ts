
import {autoserialize, autoserializeAs} from "cerialize/dist/serialize";
import {ActionLogEntry} from "./action_log_entry";

export class DecisionLogEntry {
    @autoserialize public actionName : string;
    @autoserialize public score : number;
    @autoserializeAs(ActionLogEntry) actions : ActionLogEntry[];

    public static OnDeserialized(logEntry : DecisionLogEntry, json : string) : void {
        logEntry.score = parseFloat(logEntry.score.toFixed(4));
    }
}
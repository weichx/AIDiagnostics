import {autoserialize, autoserializeAs} from "cerialize/dist/serialize";
import {Consideration} from "./consideration_log_entry";
import {Requirement} from "./requirement_log_entry";

export class ActionLogEntry {
    @autoserialize public name : string;
    @autoserialize public context : string;
    @autoserialize public score : number;
    @autoserialize public weight : number;
    @autoserialize public time : number;
    @autoserializeAs(Consideration) considerations : Consideration[];
    @autoserializeAs(Requirement) requirements : Requirement[];

    public  static  OnDeserialized(actionLogEntry : ActionLogEntry, json : string) : void {
        actionLogEntry.score = parseFloat((actionLogEntry.score).toFixed(4));
    }
}
import {Injector} from "needles/built/src/injector";
import {DecisionLogEntry} from "../objects/decision_log_entry";

export class SelectedEntryService {
    public selectedLogEntry : DecisionLogEntry;

    constructor() {
        this.selectedLogEntry = null;
    }
}

Injector.provide('selection', new SelectedEntryService());
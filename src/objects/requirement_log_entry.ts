import {autoserialize} from "cerialize/dist/serialize";

export class Requirement {
    @autoserialize public name : string;
    @autoserialize public passed : boolean;
}
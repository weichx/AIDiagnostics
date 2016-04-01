import {autoserialize} from "cerialize/dist/serialize";
import {ResponseCurve} from "./response_curve";

export class Consideration {
    @autoserialize public name : string;
    @autoserialize public input : number;
    @autoserialize public output : number;
    public curve : ResponseCurve;
    
    public static  OnDeserialized(consideration : Consideration, json : string) : any {
        consideration.curve = new ResponseCurve((<any>json).curve);
        consideration.input = parseFloat(consideration.input.toFixed(4));
        consideration.output = parseFloat(consideration.output.toFixed(4));
    }
}
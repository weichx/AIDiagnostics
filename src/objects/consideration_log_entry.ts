import {autoserialize} from "cerialize/dist/serialize";
import {ResponseCurve} from "./response_curve";

export class Consideration {
    @autoserialize public name : string;
    @autoserialize public input : number;
    @autoserialize public output : number;
    public curve : ResponseCurve;
    
    private originalInput : number;
    private originalOutput : number;
    private originalCurve : ResponseCurve;
    private _isPristine : boolean;
    
    public static  OnDeserialized(consideration : Consideration, json : string) : any {
        consideration.curve = new ResponseCurve((<any>json).curve);
        consideration.input = parseFloat(consideration.input.toFixed(4));
        consideration.output = parseFloat(consideration.output.toFixed(4));
        consideration.save();
    }
    
    private save() : void {
        this._isPristine = true;
        this.originalInput = this.input;
        this.originalOutput = this.output;
        this.originalCurve = this.curve.clone();
    }

    public update(input? : number) : void {
        if(input) this.input = input;
        if(this.curve.isValid) {
            this.output = parseFloat(this.curve.score(this.input).toFixed(4));
            this._isPristine = false;
        }
    }
    
    public restore() : void {
        this.input = this.originalInput;
        this.output = this.originalOutput;
        this.curve = this.originalCurve.clone();
        this._isPristine = true;
    }
    
    public get isPristine() : boolean {
        return this._isPristine;
    }
}
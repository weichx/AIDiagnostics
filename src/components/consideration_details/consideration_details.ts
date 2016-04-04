import {VueComponent, prop, data, watch} from "../../vue_ext/vue_ext";
import {VueApi} from "../../vue_ext/vue_api";
import {Consideration} from "../../objects/consideration_log_entry";
import {ResponseCurve} from "../../objects/response_curve";
import {inject} from "needles/built/src/injector";
import {Plotter} from "../../services/graph_buider";

@VueComponent('consideration-details-component', require('./consideration_details.haml'))
export class ConsiderationDetails extends VueApi {

    @prop consideration : Consideration;

    @inject('plotter') public plotter : Plotter;

    @data public slope : number;

    public ready() : void {
        this.setCurve();
    }

    public beforeDestroy() : void {
        document.getElementById('#plot-target').innerHTML = '';
    }

    @watch('consideration', {deep: true})
    public setCurve() : void {
        this.consideration.update();
        if(this.consideration.curve.isValid) {
            this.plotter('#plot-target', this.consideration.curve, this.consideration.output);
        }
    }

    public restoreCurve() : void {
        this.consideration.restore();
        this.setCurve();
    }
}
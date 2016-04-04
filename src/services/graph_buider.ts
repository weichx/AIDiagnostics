import {ResponseCurve} from "../objects/response_curve";
import Response = axios.Response;
import {Injector} from "needles/built/src/injector";

declare var functionPlot : any;

export type Plotter = (target : string, curve : ResponseCurve, output : number, xLabel? : string) => any;

export function polynomial(input : number, slope : number, exp : number, vShift : number, hShift : number) : number {
    return slope * ((input - hShift) ^ exp) + vShift;
}

export function inversePolynomial(input : number, slope : number, exp : number, vShift : number, hShift : number) : number {
    var output = polynomial(input, slope, exp, vShift, hShift);
    return polynomial(output, slope, exp, vShift, hShift);
}

export function buildPolynomial(curve : ResponseCurve) : string {
    return `${curve.slope} * ((x - ${curve.hShift}) ^ ${curve.exp}) + ${curve.vShift}`;
}

export function buildInversePolynomial(curve : ResponseCurve) : string {
    // functionPlot({
    //     target: '#demo',
    //     data: [{
    //         fn: 'x + (-1 * (y - 1) ^ (2)) + 3',
    //         fnType: 'implicit'
    //     }]
    // });
    return `x + (${curve.slope} * ((x - ${curve.hShift}) ^ ${curve.exp}) + ${curve.vShift})`;
}



export function plot(target : string, curve : ResponseCurve, output : number, xLabel : string = 'Input') : void {
    var plotData = {
        target: target,
        xAxis: {label: xLabel, domain: [-0.1, 1.1]},
        yAxis: {label: 'Desire', domain: [-0.1, 1.1]},
        annotations: [{x: output, text: 'output'}],
        data: []
    };
    switch(curve.type) {
        case ResponseCurve.Polynomial:
            plotData.data.push({fn: buildPolynomial(curve)});
            break;
        case ResponseCurve.InversePolynomial:
            plotData.data.push({fn: buildInversePolynomial(curve), fnType: 'implicit'});
            break;
    }
    if(curve.threshold !== 0) {
        plotData.annotations.push({x: curve.threshold, text: 'threshold'})
    }
    functionPlot(plotData);
}

Injector.provide('plotter', plot);
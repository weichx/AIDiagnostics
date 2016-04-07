import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import {VueComponent, data} from "../vue_ext/vue_ext";
import {VueApi} from "../vue_ext/vue_api";
import {DecisionLogEntry} from "../objects/decision_log_entry";
import {DecisionListComponent} from "../components/decision_list/decision_list_component";
import {DecisionDetailComponent} from "../components/decision_details/decision_details";
import {ActionDetailComponent} from "../components/action_details/action_details";
import {inject} from "needles/built/src/injector";
import {DecisionLog} from "../objects/decision_log";
import {ActionLogEntry} from "../objects/action_log_entry";
import {Consideration} from "../objects/consideration_log_entry";
import {ConsiderationDetails} from "../components/consideration_details/consideration_details";

Vue.config.debug = true;
Vue.use(VueRouter);

@VueComponent("main-component", require('./main.haml'))
export class MainVue extends VueApi {

    @data public currentDecisionEntry : DecisionLogEntry;
    @data public currentActionEntry : ActionLogEntry;
    @data public currentConsiderationEntry : Consideration;

    @inject('decisionLog') public decisionLog : DecisionLog;

}

var router = new VueRouter();

router.map({
    '/' : {
        component : MainVue.getVueClassAsync()
    },
    '/entities/:entityName': {
        component: DecisionListComponent.getVueClassAsync(),
        subRoutes: {
            '/decisions'
        }
    },
    '/decisions/:decisionIndex': {
        component: DecisionDetailComponent.getVueClassAsync()
    },
    '/decisions/:decisionIndex/actions/:actionIndex': {
        component: ActionDetailComponent.getVueClassAsync()
    },
    '/decision/:decisionIndex/actions/:actionIndex/considerations/:considerationIndex': {
        component: ConsiderationDetails.getVueClassAsync()    
    }
});

router.redirect({
    '*': '/'
});

router.start(Vue.extend(), "#mount");


//entity Name / decisions / id / actions / id / considerations / id
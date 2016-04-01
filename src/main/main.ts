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

Vue.config.debug = true;
Vue.use(VueRouter);

@VueComponent("main-component", require('./main.haml'))
export class MainVue extends VueApi {

    @data public currentDecisionEntry : DecisionLogEntry;
    @data public currentActionEntry : ActionLogEntry;
    
    @inject('decisionLog') public decisionLog : DecisionLog;
}

var router = new VueRouter();

router.map({
    '/' : {
        component : MainVue.getVueClassAsync()
    },
    '/decisions': {
        component: DecisionListComponent.getVueClassAsync()
    },
    '/decisions/:decisionIndex': {
        component: DecisionDetailComponent.getVueClassAsync()
    },
    '/decisions/:decisionIndex/actions/:actionIndex': {
        component: ActionDetailComponent.getVueClassAsync()
    },
});

router.redirect({
    '*': '/'
});

router.start(Vue.extend(), "#mount");
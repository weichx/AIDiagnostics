import Vue = require('vue');
import ComponentOption = vuejs.ComponentOption;
import PropOption = vuejs.PropOption;
import VueStatic = vuejs.VueStatic;
import {Injector} from "needles/built/src/injector";
import {VueApi} from "./vue_api";

//these are all the hooks vue expects, we need to grab these methods (if defined) from our input class
//to slap them onto the vue instance
var internalHooks = [
    'data',
    'el',
    'init',
    //'created', ignore because of custom constructor usage
    'ready',
    'beforeCompile',
    'compiled',
    'beforeDestroy',
    'destroyed',
    'attached',
    'detached',
    'activate'
];

//describe an event handler
export interface IEventDescriptor {
    once : boolean;
    method : (...args : any[]) => any;
}

//describe a watch
export interface IWatchOptions {
    deep? : boolean;
    immediate? : boolean;
}

//describe vue props
//noinspection ReservedWordAsName
export interface IPropOptions {
    type : any;
    default : any;
    required : boolean;
    twoWay : boolean;
    validator : (value : any) => boolean
    coerce : (value : any) => any;
}

export interface Indexable<T> {
    [key : string] : T;
}

export type IndexableObject = Indexable<any>;


type DataFields = Indexable<string>;
type PropFields = Indexable<IPropOptions>;
type EventFields = Indexable<IEventDescriptor>;
type WatchFields = Indexable<any>;

var componentMap = new Map<Object, VueStatic>();
var dataFieldMap = new Map<Function, DataFields>(); //maps a type to a map of data fields
var propFieldMap = new Map<Function, PropFields>(); //maps a type to a map of props
var eventMap = new Map<Function, EventFields>();    //maps a type to a map of events
var watchMap = new Map<Function, WatchFields>();    //maps a type to a map of watchers

//@data annotation, takes in the property name and adds that field to the corresponding types dataFieldMap for later introspection
export function data(targetPrototype : Object, key : string) {
    var type = targetPrototype.constructor;
    var dataFields = dataFieldMap.get(type) || <DataFields>{};
    dataFields[key] = key;
    dataFieldMap.set(type, dataFields);
}

//@prop annotation, takes in the property name and adds that field to the corresponding types dataFieldMap for later introspection
//this can be given either nothing or an option hash. when an option hash is given, use the keys as described in IPropDescriptor
export function prop(targetPrototypeOrOptions? : Object|IPropOptions, key? : string) : any {
    if (Vue.util.isPlainObject(targetPrototypeOrOptions) && !key) {

        return function (targetPrototype : Object, key : string) {
            let propOptions = <IPropOptions>targetPrototypeOrOptions;
            let type = targetPrototype.constructor;
            let propFields = propFieldMap.get(type) || <PropFields>{};
            let propDescriptor = propFields[key] || <IPropOptions>{};

            propDescriptor.coerce = propOptions.coerce || propDescriptor.coerce;
            propDescriptor.required = propOptions.required || propDescriptor.required;
            propDescriptor.type = propOptions.type || propDescriptor.type;
            propDescriptor.twoWay = propOptions.twoWay || propDescriptor.twoWay;
            propDescriptor.validator = propOptions.validator || propDescriptor.validator;
            propDescriptor.default = propOptions.default || propDescriptor.default;

            propFields[key] = propDescriptor;
            propFieldMap.set(type, propFields);
        }

    }
    else {
        let type = targetPrototypeOrOptions.constructor;
        let propFields = propFieldMap.get(type) || <PropFields>{};
        propFields[key] = <IPropOptions>{required : false};
        propFieldMap.set(type, propFields);
    }

}
//@on annotation, takes an event name. this is only valid for methods
export function on(eventName : string) {
    return function on<T extends Function>(targetPrototype : any, key : string, descriptor : TypedPropertyDescriptor<T>) {
        var type = targetPrototype.constructor;
        var events = eventMap.get(type) || <EventFields> {};
        events[eventName] = {once : false, method : targetPrototype[key]};
        eventMap.set(type, events);
    }
}

//once annotation, same as @on but will remove the handler when fired
export function once(eventName : string) {
    return function once<T extends Function>(targetPrototype : any, key : string, descriptor : TypedPropertyDescriptor<T>) {
        var type = targetPrototype.constructor;
        var events = eventMap.get(type) || <EventFields> {};
        events[eventName] = {once : true, method : targetPrototype[key]};
        eventMap.set(type, events);
    }
}

//@watch annotation, only valid for methods. when the given expression is true, triggers annotated method
export function watch(expression : string, watchOptions? : IWatchOptions) {
    return function once<T extends Function>(targetPrototype : any, key : string, descriptor : TypedPropertyDescriptor<T>) {
        var type = targetPrototype.constructor;
        var watches = watchMap.get(type) || <WatchFields> {};
        watches[expression] = watches[expression] || [];
        watches[expression].push({options : watchOptions, method : targetPrototype[key]});
        watchMap.set(type, watches);
    }
}

//todo accept vue component config object
//@VueComponent annotation. expects a name ie 'my-component' and a template as defined by vue (html string or selector)
//this is important for two reasons. first it allows us a nice, typed class interface instead of the object spaghetti
//that normal vue components are defined in. secondly it allows us a hook to do dependency injection nicely with
//needles since we can introspect annotations and resolve the component asynchronously.

//The way this works is somewhat complex. Vue expects a component to be created with a config object that has lots
//of fields on it. I think this is annoying, so this annotation will let us write a regular (but annotated) typescript
//class and then will compile that class into a vue-formatted component definition. So for each field type that we
//annotated, we need to collect the values and compile the corresponding vue description. We also need to suck in
//all the life cycle hook methods on the typescript class, gather all the property accessors(get/set) and then
//slap all this data onto a new config object when the component's `created` hook fires.
export function VueComponent(name : string, template : string, vueConfig : any = {}) {
    return function (target : any) {

        var proto : any = target.prototype;
        var events : EventFields = eventMap.get(target) || {};
        var watches : WatchFields = watchMap.get(target) || {};
        var dataFields : DataFields = dataFieldMap.get(target) || {};
        var propFields : PropFields = propFieldMap.get(target) || {};

        //todo error if something is prop & data

        //gets default values from current instance to slap onto vue instance
        var dataFn = function () {
            var output : any = {};
            Object.keys(dataFields).forEach((key : string) => {
                output[key] = this[key];
            });
            return output;
        };

        //gets props and default values from current isntance to slap onto vue instance
        var getProps = function () {
            var output : any = {};
            Object.keys(propFields).forEach((key : string) => {
                output[key] = propFields[key];
            });
            return output;
        };

        var options : any = {
            name : name,
            template : template,
            methods : {},
            computed : {},
            props : getProps(),
            data : dataFn,
            //because of the way Vue extension works (with object.create) we never get our constructors invoked
            //this code will invoke the class constructors as expected, handle some annotation actions and
            //handle any dependency injection
            created : function () : void {
                //todo convert this to a plug-in architecture
                Object.keys(watches).forEach((expression : string) => {
                    watches[expression].forEach((watch : any) => {
                        this.$watch(expression, watch.method, watch.options);
                    });
                });
                Object.keys(events).forEach((key : string) => {
                    var descriptor = events[key];
                    if (descriptor.once) {
                        this.$once(key, descriptor.method);
                    }
                    else {
                        this.$on(key, descriptor.method);
                    }
                });

                //at this point we have all our dependencies
                //now we want to attached them to right properties in our instance
                //todo -- possible problem: if a dependency is mocked AFTER we resolve
                //the component, the mocks wont be applied. Unsure how to approach this
                //because the created hook is not promise aware
                var keys = Object.keys(dependencyIndex);
                for (var i = 0; i < keys.length; i++) {
                    (<any>this)[keys[i]] = dependencyIndex[keys[i]];
                }

                target.call(this); //invoke the real constructor

                //respect the users `created` hook if implemented
                if (typeof proto.created === 'function') proto.created.call(this);
            }
        };

        //attach the prototype methods from the class to the vue option set
        Object.getOwnPropertyNames(proto).forEach(function (key : string) {

            if (key === 'constructor') return;

            // hooks
            if (internalHooks.indexOf(key) > -1) {
                options[key] = proto[key];
                return;
            }

            var descriptor = Object.getOwnPropertyDescriptor(proto, key);
            // methods
            if (typeof descriptor.value === 'function') {
                options.methods[key] = descriptor.value;
            }
            // computed properties
            else if (descriptor.get || descriptor.set) {
                options.computed[key] = {
                    get : descriptor.get,
                    set : descriptor.set
                }
            }

        });

        //look up the super class
        var Super : any = componentMap.get(target.prototype.__proto__) || Vue;
        //extend the super class (uses the vue method, not the typescript one)
        var subclass = Super.extend(options);
        var dependencyIndex : IndexableObject = null;
        //map our prototype to the subclass in case something wants to extend
        //our subclass later on.
        componentMap.set(proto, subclass);
        //asynchronously declare our component. we want to resolve this only after
        //all our injected dependencies have been resolved. that way by the time
        //and instance's constructor runs all dependencies have been injected and are available
        //in the component's normal life cycle
        (function(targetClass : any) {
            var injectionPromise = Injector.getInjectedDependencies(targetClass).then(function (dependencies : IndexableObject) {
                dependencyIndex = dependencies;
                targetClass.setVueClass(subclass);
                return subclass;
            });

            Vue.component(name, function (resolve : any) {
                injectionPromise.then(resolve);
            });
        })(target);


        return target;
    }
}

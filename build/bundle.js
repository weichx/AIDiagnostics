webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);
	module.exports = __webpack_require__(7);


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	//this is purely for type data
	var VueApi = (function () {
	    function VueApi() {
	    }
	    return VueApi;
	}());
	exports.VueApi = VueApi;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Vue = __webpack_require__(3);
	var injector_1 = __webpack_require__(5);
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
	var componentMap = new Map();
	var dataFieldMap = new Map(); //maps a type to a map of data fields
	var propFieldMap = new Map(); //maps a type to a map of props
	var eventMap = new Map(); //maps a type to a map of events
	var watchMap = new Map(); //maps a type to a map of watchers
	//@data annotation, takes in the property name and adds that field to the corresponding types dataFieldMap for later introspection
	function data(targetPrototype, key) {
	    var type = targetPrototype.constructor;
	    var dataFields = dataFieldMap.get(type) || {};
	    dataFields[key] = key;
	    dataFieldMap.set(type, dataFields);
	}
	exports.data = data;
	//@prop annotation, takes in the property name and adds that field to the corresponding types dataFieldMap for later introspection
	//this can be given either nothing or an option hash. when an option hash is given, use the keys as described in IPropDescriptor
	function prop(targetPrototypeOrOptions, key) {
	    if (Vue.util.isPlainObject(targetPrototypeOrOptions)) {
	        return function (targetPrototype, key) {
	            var propOptions = targetPrototypeOrOptions;
	            var type = targetPrototype.constructor;
	            var propFields = propFieldMap.get(type) || {};
	            var propDescriptor = propFields[key] || {};
	            propDescriptor.coerce = propOptions.coerce || propDescriptor.coerce;
	            propDescriptor.required = propOptions.required || propDescriptor.required;
	            propDescriptor.type = propOptions.type || propDescriptor.type;
	            propDescriptor.twoWay = propOptions.twoWay || propDescriptor.twoWay;
	            propDescriptor.validator = propOptions.validator || propDescriptor.validator;
	            propDescriptor.default = propOptions.default || propDescriptor.default;
	            propFields[key] = propDescriptor;
	            propFieldMap.set(type, propFields);
	        };
	    }
	    else {
	        var type = targetPrototypeOrOptions.constructor;
	        var propFields = propFieldMap.get(type) || {};
	        propFields[key] = {};
	        propFieldMap.set(type, propFields);
	    }
	}
	exports.prop = prop;
	//@on annotation, takes an event name. this is only valid for methods
	function on(eventName) {
	    return function on(targetPrototype, key, descriptor) {
	        var type = targetPrototype.constructor;
	        var events = eventMap.get(type) || {};
	        events[eventName] = { once: false, method: targetPrototype[key] };
	        eventMap.set(type, events);
	    };
	}
	exports.on = on;
	//once annotation, same as @on but will remove the handler when fired
	function once(eventName) {
	    return function once(targetPrototype, key, descriptor) {
	        var type = targetPrototype.constructor;
	        var events = eventMap.get(type) || {};
	        events[eventName] = { once: true, method: targetPrototype[key] };
	        eventMap.set(type, events);
	    };
	}
	exports.once = once;
	//@watch annotation, only valid for methods. when the given expression is true, triggers annotated method
	function watch(expression, watchOptions) {
	    return function once(targetPrototype, key, descriptor) {
	        var type = targetPrototype.constructor;
	        var watches = watchMap.get(type) || {};
	        watches[expression] = watches[expression] || [];
	        watches[expression].push({ options: watchOptions, method: targetPrototype[key] });
	        watchMap.set(type, watches);
	    };
	}
	exports.watch = watch;
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
	function VueComponent(name, template, vueConfig) {
	    if (vueConfig === void 0) { vueConfig = {}; }
	    return function (target) {
	        var proto = target.prototype;
	        var events = eventMap.get(target) || {};
	        var watches = watchMap.get(target) || {};
	        var dataFields = dataFieldMap.get(target) || {};
	        var propFields = propFieldMap.get(target) || {};
	        //todo error if something is prop & data
	        //gets default values from current instance to slap onto vue instance
	        var dataFn = function () {
	            var _this = this;
	            var output = {};
	            Object.keys(dataFields).forEach(function (key) {
	                output[key] = _this[key];
	            });
	            return output;
	        };
	        //gets props and default values from current isntance to slap onto vue instance
	        var getProps = function () {
	            var output = {};
	            Object.keys(propFields).forEach(function (key) {
	                output[key] = propFields[key];
	            });
	            return output;
	        };
	        var options = {
	            name: name,
	            template: template,
	            methods: {},
	            computed: {},
	            props: getProps(),
	            data: dataFn,
	            //because of the way Vue extension works (with object.create) we never get our constructors invoked
	            //this code will invoke the class constructors as expected, handle some annotation actions and
	            //handle any dependency injection
	            created: function () {
	                var _this = this;
	                //todo convert this to a plug-in architecture
	                Object.keys(watches).forEach(function (expression) {
	                    watches[expression].forEach(function (watch) {
	                        _this.$watch(expression, watch.method, watch.options);
	                    });
	                });
	                Object.keys(events).forEach(function (key) {
	                    var descriptor = events[key];
	                    if (descriptor.once) {
	                        _this.$once(key, descriptor.method);
	                    }
	                    else {
	                        _this.$on(key, descriptor.method);
	                    }
	                });
	                //at this point we have all our dependencies
	                //now we want to attached them to right properties in our instance
	                //todo -- possible problem: if a dependency is mocked AFTER we resolve
	                //the component, the mocks wont be applied. Unsure how to approach this
	                //because the created hook is not promise aware
	                var keys = Object.keys(dependencyIndex);
	                for (var i = 0; i < keys.length; i++) {
	                    this[keys[i]] = dependencyIndex[keys[i]];
	                }
	                target.call(this); //invoke the real constructor
	                //respect the users `created` hook if implemented
	                if (typeof proto.created === 'function')
	                    proto.created.call(this);
	            }
	        };
	        //attach the prototype methods from the class to the vue option set
	        Object.getOwnPropertyNames(proto).forEach(function (key) {
	            if (key === 'constructor')
	                return;
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
	            else if (descriptor.get || descriptor.set) {
	                options.computed[key] = {
	                    get: descriptor.get,
	                    set: descriptor.set
	                };
	            }
	        });
	        //look up the super class
	        var Super = componentMap.get(target.prototype.__proto__) || Vue;
	        //extend the super class (uses the vue method, not the typescript one)
	        var subclass = Super.extend(options);
	        var dependencyIndex = null;
	        //map our prototype to the subclass in case something wants to extend
	        //our subclass later on.
	        componentMap.set(proto, subclass);
	        //asynchronously declare our component. we want to resolve this only after
	        //all our injected dependencies have been resolved. that way by the time
	        //and instance's constructor runs all dependencies have been injected and are available
	        //in the component's normal life cycle
	        Vue.component(name, function (resolve) {
	            injector_1.Injector.getInjectedDependencies(target).then(function (dependencies) {
	                dependencyIndex = dependencies;
	                resolve(subclass);
	            });
	        });
	        return target;
	    };
	}
	exports.VueComponent = VueComponent;


/***/ },
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var provider_1 = __webpack_require__(6);
	function noSuchProvider(name) {
	    throw new Error("Unable to locate provider '" + name + "'. Make sure you register this provide before attempting to use it");
	}
	function construct(constructor, args) {
	    if (args === void 0) { args = []; }
	    function F() {
	        constructor.apply(this, args);
	    }
	    F.prototype = constructor.prototype;
	    return new F();
	}
	var Needle = (function () {
	    function Needle() {
	        this.providerMap = {};
	        this.onDefinedHandlers = {};
	        this.onResolveHandlers = {};
	        this.injectionMapRegistry = new Map();
	    }
	    Needle.prototype.inject = function (injectionKey) {
	        var _this = this;
	        return function (prototype, key) {
	            var type = prototype.constructor;
	            var injectionMap = _this.getInjectionMap(type);
	            injectionMap[key] = injectionKey;
	        };
	    };
	    Needle.prototype.provide = function (providerName, impl) {
	        this.resolve(this.define(providerName), impl);
	    };
	    Needle.prototype.provideAsync = function (providerName, depsOrImpl, implementationPromise) {
	        var _this = this;
	        var deps = null;
	        if (implementationPromise) {
	            deps = depsOrImpl;
	        }
	        else {
	            deps = [];
	            implementationPromise = depsOrImpl;
	        }
	        return new Promise(function (resolve) {
	            var onResolved = function () {
	                var provider = _this.providerMap[providerName];
	                var resolvedDependencies = provider.dependencies.map(function (depName) {
	                    return _this.providerMap[depName].get();
	                });
	                var impl = implementationPromise.apply(null, resolvedDependencies);
	                if (impl && typeof impl.then === 'function') {
	                    impl.then(function (result) {
	                        resolve(_this.resolve(provider, result));
	                    });
	                }
	                else {
	                    resolve(_this.resolve(provider, impl));
	                }
	            };
	            var onDefined = function () {
	                if (_this.checkCycles(providerName)) {
	                    throw new Error('Cycles found!');
	                }
	                _this.onAllResolved(deps, onResolved);
	            };
	            _this.define(providerName, deps);
	            _this.onAllDefined(deps, onDefined);
	        });
	    };
	    Needle.prototype.mock = function (providerName, mockName, impl) {
	        var provider = this.providerMap[providerName] || new provider_1.default(providerName);
	        provider.addMock(mockName, [], impl);
	        this.providerMap[providerName] = provider;
	    };
	    // public mockAsync(providerName : string, mockName : string, dependencies : Array<string>, impl : any) : void {
	    //
	    // }
	    Needle.prototype.useMock = function (providerName, mockName) {
	        var provider = this.providerMap[providerName];
	        if (!provider)
	            return noSuchProvider(providerName);
	        provider.useMock(mockName);
	        if (this.checkCycles(providerName)) {
	            throw new Error("Cycle");
	        }
	        var definitionCallbacks = this.onDefinedHandlers[providerName];
	        this.onDefinedHandlers[providerName] = null;
	        if (!definitionCallbacks)
	            return;
	        for (var i = 0; i < definitionCallbacks.length; i++) {
	            definitionCallbacks[i]();
	        }
	    };
	    Needle.prototype.useActual = function (providerName) {
	        var provider = this.providerMap[providerName];
	        if (!provider)
	            return noSuchProvider(providerName);
	        provider.useActual();
	    };
	    Needle.prototype.get = function (providerName, variantName) {
	        var provider = this.providerMap[providerName];
	        if (!provider)
	            return noSuchProvider(providerName);
	        return provider.get(variantName);
	    };
	    //todo figure out the generics here for type checking, tuples dont seem to work as expected
	    Needle.prototype.create = function (type, options) {
	        return this.injectDependencies(construct(type, []), options);
	    };
	    Needle.prototype.injectDependencies = function (instance, options) {
	        function injectDependencies(dependencies) {
	            var keys = Object.keys(dependencies);
	            for (var i = 0; i < keys.length; i++) {
	                instance[keys[i]] = dependencies[keys[i]];
	            }
	            return instance;
	        }
	        return this.getInjectedDependencies(instance.constructor, options).then(injectDependencies);
	    };
	    Needle.prototype.getInjectedDependencies = function (type, overrides) {
	        var _this = this;
	        if (overrides === void 0) { overrides = {}; }
	        return new Promise(function (resolve) {
	            var propertyLookup = _this.injectionMapRegistry.get(type) || {};
	            var propertyNames = Object.keys(propertyLookup);
	            var providerNames = [];
	            for (var i = 0; i < propertyNames.length; i++) {
	                providerNames[i] = propertyLookup[propertyNames[i]];
	            }
	            var awaitedProviderNames = propertyNames.filter(function (name) {
	                return overrides[name] === void 0;
	            }).map(function (name) {
	                return propertyLookup[name];
	            });
	            _this.onAllDefined(awaitedProviderNames, function () {
	                _this.onAllResolved(awaitedProviderNames, function () {
	                    var injectedDependencies = {};
	                    for (var i = 0; i < propertyNames.length; i++) {
	                        var providerName = providerNames[i];
	                        var propertyName = propertyNames[i];
	                        injectedDependencies[propertyName] = overrides[propertyName] || _this.get(providerName);
	                    }
	                    resolve(injectedDependencies);
	                });
	            });
	        });
	    };
	    Needle.prototype.checkCycles = function (providerName, stack) {
	        if (stack === void 0) { stack = []; }
	        var provider = this.providerMap[providerName];
	        if (stack.indexOf(providerName) !== -1) {
	            throw new Error("Found cycle in " + stack.join(' -> ') + ' -> ' + providerName);
	        }
	        stack.push(providerName);
	        for (var i = 0; i < provider.dependencies.length; i++) {
	            this.checkCycles(provider.dependencies[i], stack);
	        }
	        stack.pop();
	    };
	    Needle.prototype.define = function (providerName, dependencies) {
	        if (dependencies === void 0) { dependencies = []; }
	        var provider = this.providerMap[providerName] || new provider_1.default(providerName, dependencies);
	        var definitionCallbacks = this.onDefinedHandlers[providerName];
	        this.providerMap[providerName] = provider;
	        if (!definitionCallbacks)
	            return provider;
	        for (var i = 0; i < definitionCallbacks.length; i++) {
	            definitionCallbacks[i]();
	        }
	        this.onDefinedHandlers[providerName] = null;
	        return provider;
	    };
	    Needle.prototype.onDefined = function (providerName, callback) {
	        if (this.providerMap[providerName]) {
	            return callback();
	        }
	        var handlers = this.onDefinedHandlers[providerName] || [];
	        handlers.push(callback);
	        this.onDefinedHandlers[providerName] = handlers;
	    };
	    Needle.prototype.onAllDefined = function (dependencies, callback) {
	        var defineCount = 0;
	        var defineTotal = dependencies.length;
	        if (defineTotal === 0)
	            return callback();
	        function definedCallback() {
	            if (++defineCount === defineTotal)
	                callback();
	        }
	        for (var i = 0; i < dependencies.length; i++) {
	            this.onDefined(dependencies[i], definedCallback);
	        }
	    };
	    Needle.prototype.resolve = function (provider, impl) {
	        provider.setActual(impl);
	        var resolutionCallbacks = this.onResolveHandlers[provider.name];
	        if (!resolutionCallbacks)
	            return provider;
	        for (var i = 0; i < resolutionCallbacks.length; i++) {
	            resolutionCallbacks[i]();
	        }
	        this.onResolveHandlers[provider.name] = null;
	        return provider;
	    };
	    Needle.prototype.onResolved = function (providerName, callback) {
	        var provider = this.providerMap[providerName];
	        if (provider.isResolved) {
	            return callback();
	        }
	        var resolutionCallbacks = this.onResolveHandlers[providerName] || [];
	        resolutionCallbacks.push(callback);
	        this.onResolveHandlers[providerName] = resolutionCallbacks;
	    };
	    Needle.prototype.onAllResolved = function (dependencies, callback) {
	        var resolvedCount = 0;
	        var totalToResolve = dependencies.length;
	        if (totalToResolve === 0)
	            return callback();
	        function onProviderResolved() {
	            if (++resolvedCount === totalToResolve)
	                callback();
	        }
	        for (var i = 0; i < dependencies.length; i++) {
	            this.onResolved(dependencies[i], onProviderResolved);
	        }
	    };
	    Needle.prototype.getInjectionMap = function (type) {
	        if (!type)
	            return {};
	        var map = this.injectionMapRegistry.get(type);
	        if (!map) {
	            var parentMap = this.getInjectionMap(Object.getPrototypeOf(type));
	            map = (parentMap) ? JSON.parse(JSON.stringify(parentMap)) : {};
	        }
	        this.injectionMapRegistry.set(type, map);
	        return map;
	    };
	    Needle.prototype.reset = function () {
	        Needle.call(this);
	    };
	    return Needle;
	}());
	exports.Needle = Needle;
	exports.Injector = new Needle();
	function inject(injectionKey) {
	    return exports.Injector.inject(injectionKey);
	}
	exports.inject = inject;
	//# sourceMappingURL=injector.js.map

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	function noSuchMock(providerName, mockName) {
	    throw new Error("No mock named '" + mockName + "' exists for provider '" + providerName + "'");
	}
	function mockAlreadyRegistered(providerName, mockName) {
	    throw new Error("Provider '" + providerName + " already has a mock named " + mockName + " registered");
	}
	var ProviderVariant = (function () {
	    function ProviderVariant(name, dependencies, implementation) {
	        if (dependencies === void 0) { dependencies = []; }
	        this.name = name;
	        this.dependencies = dependencies;
	        this.implementation = implementation;
	    }
	    Object.defineProperty(ProviderVariant.prototype, "isResolved", {
	        get: function () {
	            return this.implementation !== void 0;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return ProviderVariant;
	}());
	var Provider = (function () {
	    function Provider(name, dependencies) {
	        if (dependencies === void 0) { dependencies = []; }
	        this.name = name;
	        this.mocks = {};
	        this.dependencies = dependencies;
	        this.actual = new ProviderVariant('__actual__', dependencies);
	        this.activeVariant = this.actual;
	    }
	    Object.defineProperty(Provider.prototype, "isResolved", {
	        get: function () {
	            return this.activeVariant.isResolved;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Provider.prototype, "isMocked", {
	        get: function () {
	            return this.activeVariant !== this.actual;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Provider.prototype.get = function (variantName) {
	        if (variantName === void 0) { variantName = null; }
	        if (variantName) {
	            var variant = this.mocks[variantName];
	            if (!variant)
	                throw new Error("Not variant");
	            return variant.implementation;
	        }
	        return this.activeVariant.implementation;
	    };
	    Provider.prototype.has = function (variantName) {
	        return this.get(variantName) !== void 0;
	    };
	    Provider.prototype.setActual = function (value) {
	        if (this.actual.implementation !== void 0) {
	            throw new Error("Provider " + this.name + " was given a non-mock implementation more than once!");
	        }
	        this.actual.implementation = value;
	    };
	    Provider.prototype.useActual = function () {
	        this.activeVariant = this.actual;
	    };
	    Provider.prototype.useMock = function (key) {
	        var mock = this.mocks[key];
	        if (!mock) {
	            noSuchMock(this.name, key);
	        }
	        else {
	            this.activeVariant = mock;
	        }
	    };
	    Provider.prototype.addMock = function (key, dependencies, implementation) {
	        this.mocks[key] = new ProviderVariant(key, dependencies, implementation);
	    };
	    return Provider;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Provider;
	//# sourceMappingURL=provider.js.map

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var MainVue = (function (_super) {
	    __extends(MainVue, _super);
	    function MainVue() {
	        _super.apply(this, arguments);
	    }
	    return MainVue;
	}(Vue));
	exports.MainVue = MainVue;


/***/ }
]);
//this is purely for type data
import Vue = vuejs.Vue;
export class VueApi {
    public $data : any;
    public $el : HTMLElement;
    public $options : Object;
    public $parent : any;
    public $root : VueApi;
    public $children : VueApi[];
    public $refs : Object;
    public $els : Object;
    public $route : any;
    // public $get : vuejs.$get;
    // public $set : vuejs.$set;
    // public $delete : vuejs.$delete;
    // public $eval : vuejs.$eval;
    // public $interpolate : vuejs.$interpolate;
    // public $log : vuejs.$log;
    // public $watch : vuejs.$watch;
    // public $on : vuejs.$on<this>;
    // public $once : vuejs.$once<this>;
    // public $off : vuejs.$off<this>;
    // public $emit : vuejs.$emit<this>;
    // public $dispatch : vuejs.$dispatch<this>;
    // public $broadcast : vuejs.$broadcast<this>;
    // public $appendTo : Vue.$appendTo<this>;
    // public $before : vuejs.$before<this>;
    // public $after : vuejs.$after<this>;
    // public $remove : vuejs.$remove<this>;
    // public $nextTick : vuejs.$nextTick;
    // public $mount : vuejs.$mount<this>;
    // public $destroy : vuejs.$destroy;
    // public $compile : vuejs.$compile;

    private static __map : any = {};
    private static __vueType : any;

    private  static setVueClass(subclass : any) : void {
        this.__vueType = subclass;
        var array = this.__map[this.toString()];
        if(array) {
            for(var i = 0; i < array.length; i++) {
                array[i](subclass);
            }
        }
    }

    //have to play games around exactly when this resolve occurs
    //or routing wont work because it thinks the component is
    //ready when it isnt and we break the app
    public static getVueClassAsync() : any {
        return (resolve : any) => {
            if(this.__vueType) {
                resolve(this.__vueType);
            }
            else {
                var array : any[] = [];
                this.__map[this.toString()] = array;
                array.push(resolve);
            }
        };
    }
}
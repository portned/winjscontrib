﻿//you may use this code freely as long as you keep the copyright notice and don't 
//alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

if (!Object.map) {
    Object.map = function (obj, mapping) {
        var mapped = {};
        if (typeof obj !== 'object') {
            return mapped;
        }
        if (typeof mapping !== 'function') {
            // We could just return obj but that wouldn't be
            // consistent with the rest of the interface which always returns
            // a new object.
            mapping = function (key, val) {
                return [key, val];
            };
        }
        Object.keys(obj).forEach(function (key) {
            var transmuted = mapping.apply(obj, [key, obj[key]]);
            if (transmuted && transmuted.length) {
                mapped[transmuted[0] || key] = transmuted[1];
            }
        });
        return mapped;
    };
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

if (!String.prototype.padLeft) {
    String.prototype.padLeft = function padLeft(length, leadingChar) {
        if (leadingChar === undefined) {
            leadingChar = "0";
        }

        return this.length < length ? (leadingChar + this).padLeft(length, leadingChar) : this;
    };
}

/**
 * @namespace MCNEXT
 */
var MCNEXT = MCNEXT || {};

var WinJSContrib = MCNEXT;

/** @namespace */
MCNEXT.UI = MCNEXT.UI || {};


/** @namespace */
MCNEXT.Utils = MCNEXT.Utils || {};

(function () {
    'use strict';

        /**
         * @class
         * @classdesc object to register and release events from addEventListener or bind
         */
        MCNEXT.UI.EventTracker = function EventTracker() {
            this.events = [];
        };

        /**
         * register an event from an object
         * @param {Object} e object containing addEventListener
         * @param {string} eventName name of the event
         * @param {function} handler
         * @param {boolean} capture
         * @returns {function} function to call for unregistering the event
         */
        MCNEXT.UI.EventTracker.prototype.addEvent = function (e, eventName, handler, capture) {
            e.addEventListener(eventName, handler, capture);
            var unregister = function () {
                try {
                    e.removeEventListener(eventName, handler);
                } catch (exception) {

                }
            };

            this.events.push(unregister);
            return unregister;
        };

        /**
         * register binding event
         * @param {Object} e object containing bind method
         * @param {string} eventName name of the binding event
         * @param {function} handler
         */
        MCNEXT.UI.EventTracker.prototype.addBinding = function (e, eventName, handler) {
            e.bind(eventName, handler);
            var unregister = function () {
                e.unbind(eventName, handler);
            };
            this.events.push(unregister);
            return unregister;
        };

        /**
         * release all registered events
         */
        MCNEXT.UI.EventTracker.prototype.dispose = function () {
            for (var i = 0; i < this.events.length; i++) {
                this.events[i]();
            }
            this.events = [];
        };

        /**
         * open appbars
         */
        MCNEXT.UI.appbarsOpen = function () {
            var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (res && res.length) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].winControl) {
                        res[i].winControl.show();
                    }
                }
            }
        };

        /**
         * close appbars
         */
        MCNEXT.UI.appbarsClose = function () {
            var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (res && res.length) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].winControl) {
                        res[i].winControl.hide();
                    }
                }
            }
        };

        /**
         * disable appbars
         */
        MCNEXT.UI.appbarsDisable = function () {
            var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (res && res.length) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].winControl) {
                        res[i].winControl.disabled = true;
                    }
                }
            }
        };

        /**
         * enable appbars
         */
        MCNEXT.UI.appbarsEnable = function () {
            $('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]').each(function () {
                if (this.winControl) {
                    this.winControl.disabled = false;
                }
            });
        };


        /** 
         * build a promise around element "load" event (work for all element with src property like images, iframes, ...)
         * @param {HTMLElement} element
         * @param {string} url url used to feed "src" on element
         * @returns {WinJS.Promise}
         */
        MCNEXT.UI.elementLoaded = function (elt, url) {
            return new WinJS.Promise(function (complete, error) {
                function onerror(e) {
                    elt.onload = undefined;
                    elt.onerror = undefined;
                    elt.onreadystatechange = undefined;
                    error('element not loaded');
                }

                function onload(e) {
                    elt.onload = undefined;
                    elt.onerror = undefined;
                    elt.onreadystatechange = undefined;
                    complete({
                        element: elt,
                        url: url
                    });
                }

                elt.onerror = onerror;
                elt.onload = onload;
                elt.onreadystatechange = onload;
                if (elt.naturalWidth > 0) {
                    onload(undefined);
                }
                elt.src = url;
            });
        };

        /**
         * Create a promise for getting an image object from url
         * @param {string} imgUrl url for the picture
         * @returns {WinJS.Promise}
         */
        MCNEXT.UI.loadImage = function (imgUrl) {
            return new WinJS.Promise(function (complete, error) {
                var image = new Image();

                function onerror(e) {
                    image.onload = undefined;
                    image.onerror = undefined;
                    error('image not loaded');
                }

                function onload(e) {
                    image.onload = undefined;
                    image.onerror = undefined;
                    complete({
                        element: image,
                        url: imgUrl
                    });
                }

                image.onerror = onerror;
                image.onload = onload;
                if (image.naturalWidth > 0) {
                    onload(undefined);
                }
                image.src = imgUrl;
            });
        };

        /**
         * List all elements found after provided element
         * @param {HTMLElement} elt target element
         * @returns {Array} list of sibling elements
         */
        MCNEXT.UI.listElementsAfterMe = function (elt) {
            var res = [];
            var passed = false;
            if (elt.parentElement) {
                var parent = elt.parentElement;
                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i] === elt) {
                        passed = true;
                    } else if (passed) {
                        res.push(parent.children[i]);
                    }
                }
            }
            return res;
        };

        /**
         * create an animation for removing an element from a list
         * @param {HTMLElement} element that will be removed
         * @returns {WinJS.Promise}
         */
        MCNEXT.UI.removeElementAnimation = function (elt) {
            return new WinJS.Promise(function (complete, error) {
                var remainings = MCNEXT.UI.listElementsAfterMe(elt);
                var anim = WinJS.UI.Animation.createDeleteFromListAnimation([
                    elt
                ], remainings);
                elt.style.position = "fixed";
                elt.style.opacity = '0';
                anim.execute().done(function () {
                    complete(elt);
                });
            });
        };

        /**
         * setup declarative binding to parent control function
         * @param {HTMLElement} element root node crawled for page actions
         * @param {Object} control control owning functions to call
         */
        MCNEXT.UI.bindPageActions = function (element, control) {
            $('*[data-page-action]', element).each(function () {
                var actionName = $(this).addClass('page-action').data('page-action');

                var action = control[actionName];
                if (action && typeof action === 'function') {
                    $(this).tap(function (eltarg) {
                        var actionArgs = $(eltarg).data('page-action-args');
                        if (actionArgs && typeof actionArgs == 'string') {
                            try {
                                var tmp = MCNEXT.Utils.readValue(eltarg, actionArgs);
                                if (tmp) {
                                    actionArgs = tmp;
                                } else {
                                    actionArgs = JSON.parse(actionArgs);
                                }
                            } catch (exception) {
                                return;
                            }
                        }

                        control[actionName].bind(control)({ elt: eltarg, args: actionArgs });
                    });
                }
            });
        };

        /**
         * setup declarative binding to page link
         * @param {HTMLElement} element root node crawled for page actions
         */
        MCNEXT.UI.bindPageLinks = function (element) {
            $('*[data-page-link]', element).each(function () {
                var target = $(this).addClass('page-link').data('page-link');

                if (target && target.indexOf('/') < 0) {
                    var tmp = MCNEXT.Utils.readProperty(window, target);
                    if (tmp) {
                        target = tmp;
                    }
                }

                if (target) {
                    $(this).tap(function (eltarg) {
                        var actionArgs = $(eltarg).data('page-action-args');
                        if (actionArgs && typeof actionArgs == 'string') {
                            try {
                                var tmp = MCNEXT.Utils.readValue(eltarg, actionArgs);
                                if (tmp) {
                                    actionArgs = tmp;
                                } else {
                                    actionArgs = JSON.parse(actionArgs);
                                }
                            } catch (exception) {
                                return;
                            }
                        }

                        if (MCNEXT.UI.parentNavigator && MCNEXT.UI.parentNavigator(eltarg)) {
                            var nav = MCNEXT.UI.parentNavigator(eltarg);
                            nav.navigate(target, actionArgs);
                        } else {
                            WinJS.Navigation.navigate(target, actionArgs);
                        }
                    });
                }
            });
        };

        /**
         * setup declarative binding to parent control function and to navigation links
         * @param {HTMLElement} element root node crawled for page actions
         * @param {Object} control control owning functions to call
         */
        MCNEXT.UI.bindActions = function (element, control) {
            MCNEXT.UI.bindPageActions(element, control);
            MCNEXT.UI.bindPageLinks(element);
        };
    

    /** 
     * return a task object
     * @param {Array} dataArray items to process with async tasks
     * @returns {MCNEXT.Task}
      */
    MCNEXT.Tasks = function (dataArray) {
        var dataPromise = WinJS.Promise.as(dataArray);

        /** 
         * @class MCNEXT.Task 
         * @see MCNEXT.Tasks
         */
        var Task =

            {
                /** 
                 * apply callback for each item in the array in waterfall 
                 * @method MCNEXT.Task#waterfall
                 * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
                 * @returns {WinJS.Promise}
                 */
                waterfall: function (promiseCallback) {
                    var resultPromise = WinJS.Promise.wrap();
                    var results = [];

                    if (!dataArray) {
                        return WinJS.Promise.wrap([]);
                    }

                    return dataPromise.then(function (items) {
                        var queueP = function (p, item) {
                            return p.then(function (r) {
                                return WinJS.Promise.as(promiseCallback(item)).then(function (r) {
                                    results.push(r);
                                });
                            });
                        }

                        for (var i = 0, l = items.length; i < l; i++) {
                            resultPromise = queueP(resultPromise, items[i]);
                        }

                        return resultPromise.then(function (r) {
                            return results;
                        });
                    });

                },

                promises: function (promiseCallback) {
                    if (!dataArray) {
                        return WinJS.Promise.wrap([]);
                    }

                    return dataPromise.then(function (items) {
                        var promises = [];
                        for (var i = 0, l = items.length; i < l; i++) {
                            promises.push(WinJS.Promise.as(promiseCallback(items[i])));
                        }

                        return promises;
                    });
                },

                /** 
                 * apply callback for each item in the array in parallel (equivalent to WinJS.Promise.join) 
                 * @method MCNEXT.Task#parallel
                 * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
                 * @returns {WinJS.Promise}
                 */
                parallel: function (promiseCallback) {
                    if (!dataArray) {
                        return WinJS.Promise.wrap([]);
                    }

                    return dataPromise.then(function (items) {
                        var promises = [];
                        for (var i = 0, l = items.length; i < l; i++) {
                            promises.push(WinJS.Promise.as(promiseCallback(items[i])));
                        }

                        return WinJS.Promise.join(promises);
                    });
                },

                /** 
                 * apply callback for each item in the array in batch of X parallel items
                 * @method MCNEXT.Task#batch
                 * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
                 * @returns {WinJS.Promise}
                 */
                batch: function (batchSize, promiseCallback) {
                    if (!dataArray) {
                        return WinJS.Promise.wrap([]);
                    }

                    return dataPromise.then(function (items) {
                        var resultPromise = WinJS.Promise.wrap();
                        var promises = [];
                        var results = [];

                        var queueBatch = function (p, batch) {
                            return p.then(function (r) {
                                return WinJS.Promise.join(batch).then(function (r) {
                                    results = results.concat(r);
                                });
                            });
                        }

                        for (var i = 0, l = items.length; i < l; i++) {
                            promises.push(WinJS.Promise.as(promiseCallback(items[i])));
                            if (i > 0 && i % batchSize == 0) {
                                resultPromise = queueBatch(resultPromise, promises);
                                promises = [];
                            }

                        }

                        if (promises.length) {
                            resultPromise = queueBatch(resultPromise, promises);
                        }

                        return resultPromise.then(function () {
                            return results;
                        });
                    });
                }

            };

        return res;
    }

    (function (Utils) {
        'use strict';

        /** indicate if string starts with featured characters 
         * @param {string} str string to search within
         * @param {string} strToMatch match string
         * @returns {boolean} true if string starts with strToMatch
         */
        MCNEXT.Utils.startsWith = function startsWith(str, strToMatch) {
            if (!strToMatch) {
                return false;
            }
            var match = (str.match("^" + strToMatch) == strToMatch);
            return match;
        }

        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (str) {
                return Utils.startsWith(this, str);
            };
        }

        /** indicate if string ends with featured characters 
         * @param {string} str string to search within
         * @param {string} strToMatch match string
         * @returns {boolean} true if string starts with strToMatch
         */
        MCNEXT.Utils.endsWith = function endsWith(str, strToMatch) {
            if (!strToMatch) {
                return false;
            }
            return (str.match(strToMatch + "$") == strToMatch);
        }

        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function (str) {
                return Utils.endsWith(this, str);
            };
        }

        /**
         * generate a string formatted as a query string from object properties
         * @param {Object} obj object to format
         * @returns {string}
         */
        MCNEXT.Utils.queryStringFrom = function queryStringFrom(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        }

        

        /**
         * trigger an event on a DOM node
         * @param {HTMLElement} element receiving the event
         * @param {string} eventName name of the event
         * @param {boolean} bubbles indicate if event should bubble
         * @param {boolean} cancellable indicate if event can be cancelled
         */
        MCNEXT.Utils.triggerEvent = function (element, eventName, bubbles, cancellable) {
            var eventToTrigger = document.createEvent("Event");
            eventToTrigger.initEvent(eventName, bubbles, cancellable);
            element.dispatchEvent(eventToTrigger);
        };

        /**
         * @param {HTMLElement} element receiving the event
         * @param {string} eventName name of the event
         * @param {boolean} bubbles indicate if event should bubble
         * @param {boolean} cancellable indicate if event can be cancelled
         */
        MCNEXT.Utils.triggerCustomEvent = function (element, eventName, bubbles, cancellable, data) {
            var eventToTrigger = document.createEvent("CustomEvent");
            eventToTrigger.initCustomEvent(eventName, bubbles, cancellable, data);
            element.dispatchEvent(eventToTrigger);
        };

        /* 
        Core object properties features
        */

        //return object value based on property name. Property name is a string containing the name of the property, 
        //or the name of the property with an indexer, ex: myproperty[2] (to get item in a array)
        function getobject(obj, prop) {
            if (!obj)
                return;

            if (prop === 'this')
                return obj;

            var baseValue = obj[prop];
            if (typeof baseValue !== "undefined")
                return baseValue;

            var idx = prop.indexOf('[');
            if (idx < 0)
                return;
            var end = prop.indexOf(']', idx);
            if (end < 0)
                return;

            var val = prop.substr(idx + 1, end - idx);
            val = parseInt(val);

            return obj[val];
        }

        //set object property value based on property name. Property name is a string containing the name of the property, 
        //or the name of the property with an indexer, ex: myproperty[2] (to get item in a array)
        function setobject(obj, prop, data) {
            if (prop) {
                obj[prop] = data;

                if (obj.setProperty)
                    obj.setProperty(prop, data);
            }

            var idx = prop.indexOf('[');
            if (idx < 0)
                return;
            var end = prop.indexOf(']', idx);
            if (end < 0)
                return;

            var val = prop.substr(idx + 1, end - idx);
            val = parseInt(val);

            obj[val] = data;
        }

        /** Read property value on an object based on expression
        * @param {Object} source the object containing data
        * @param {Object} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp, 
        * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
        * @returns {Object} property value
        */
        MCNEXT.Utils.readProperty = function readProperty(source, properties) {
            if (typeof properties == 'string' && source[properties])
                return source[properties];

            if (!properties || !properties.length)
                return source;

            var prop = getProperty(source, properties);
            if (prop) {
                return prop.propValue;
            }
        }

        /**
         * return a propery descriptor for an object based on expression
         * @param {Object} source the object containing data
         * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp, 
         * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
         * @returns {Object} property descriptor
         */
        MCNEXT.Utils.getProperty = function getProperty(source, properties) {
            if (typeof properties == 'string') {
                properties = properties.split('.');
            }

            if (!properties || !properties.length) {
                properties = ['this'];
                //return;
            }

            var parent = source;
            var previousDescriptor = null;
            for (var i = 0; i < properties.length; i++) {
                var descriptor = {
                    parent: parent,
                    parentDescriptor: previousDescriptor,
                    keyProp: properties[i],
                    ensureParent: function () {
                        if (parent) {
                            return parent;
                        } else {
                            if (this.parentDescriptor) {
                                this.parentDescriptor.ensureParent();

                                if (!this.parentDescriptor.parent[this.parentDescriptor.keyProp]) {
                                    this.parentDescriptor.parent[this.parentDescriptor.keyProp] = {};
                                    this.parent = this.parentDescriptor.parent[this.parentDescriptor.keyProp];
                                }
                            }
                        }
                    },
                    get propValue() {
                        return getobject(this.parent, this.keyProp);
                    },
                    set propValue(val) {
                        this.ensureParent();
                        return setobject(this.parent, this.keyProp, val);
                    }
                };
                previousDescriptor = descriptor;

                if (i == properties.length - 1) {
                    return descriptor;
                }
                parent = getobject(parent, properties[i]);
            }

            return;
        }

        /**
         * Write property value on an object based on expression
         * @param {Object} source the object containing data
         * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp, 
         * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
         * @param {Object} data data to feed to the property
         */
        MCNEXT.Utils.writeProperty = function (source, properties, data) {
            var prop = getProperty(source, properties);
            if (prop) {
                prop.propValue = data;
                //prop.parent[prop.keyProp] = data;
            }
        };

        /**
         * WORK ONLY FOR WINRT
         * read protocol arguments from application activation event arguments
         * @param {Object} args WinJS application activation argument
         * @returns {Object} protocol arguments
         */
        MCNEXT.Utils.readProtocol = function (args) {
            if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol && args.detail.uri) {
                var navArgs = { action: undefined };
                var protocolArgs = {};
                var queryargs = args.detail.uri.query;
                if (queryargs[0] == '?') {
                    queryargs = queryargs.substr(1);
                }
                if (queryargs) {
                    queryargs.split('&').forEach(function (item) {
                        var arg = item.split('=');

                        protocolArgs[arg[0]] = decodeURIComponent(arg[1]);
                    });
                }

                navArgs.protocol = {
                    action: args.detail.uri.host,
                    args: protocolArgs
                };

                return navArgs;
            }
        };

        /**
         * WORK ONLY FOR WINRT
         * Indicate if a valid internet connection is available, even with constrained access
         * @returns {boolean}
         */
        MCNEXT.Utils.isConnected = function () {
            var nlvl = Windows.Networking.Connectivity.NetworkConnectivityLevel;
            var profile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            if (profile !== null) {
                var level = profile.getNetworkConnectivityLevel();
                return level === nlvl.constrainedInternetAccess || level === nlvl.internetAccess;
            }
            return false;
        };

        /**
         * WORK ONLY FOR WINRT
         * Indicate if a valid internet connection is available
         * @returns {boolean}
         */
        MCNEXT.Utils.hasInternetAccess = function () {
            var nlvl = Windows.Networking.Connectivity.NetworkConnectivityLevel;
            var profile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            if (profile !== null) {
                var level = profile.getNetworkConnectivityLevel();
                return level === nlvl.internetAccess;
            }
            return false;
        };

        /** generate a random value between two numbers 
         * @param {number} from lower limit
         * @param {number} to upper limit
         * @returns {number}
         */
        MCNEXT.Utils.randomFromInterval = function (from, to) {
            return (Math.random() * (to - from + 1) + from) << 0;
        };

        /** 
         * function to useas a callback for Array.sort when you want the array to be sorted alphabetically
         * @param {string} a
         * @param {string} b
         * @returns {number}
         */
        MCNEXT.Utils.alphabeticSort = function (a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;

            return 0;
        };

        /**
         * generate an array with only distinct elements
         * @param {Array} array
         * @param {string} path to array's item property used for checking items
         * @param {boolean} ignorecase indicate if comparison should ignore case when using string
         * @returns {Array}
         */
        MCNEXT.Utils.distinctArray = function (array, property, ignorecase) {
            if (array == null || array.length == 0) return array;
            if (typeof ignorecase == "undefined") ignorecase = false;
            var sMatchedItems = "";
            var foundCounter = 0;
            var newArray = [];
            if (ignorecase) {
                for (var i = 0; i < array.length; i++) {
                    if (property) {
                        var data = MCNEXT.Utils.readProperty(array[i], property.split('.'));
                        var sFind = data;
                        if (!data)
                            sFind = data;
                        if (data && data.toLowerCase)
                            sFind = data.toLowerCase();
                    } else {
                        var sFind = array[i];
                    }
                    if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                        sMatchedItems += "|" + sFind + "|";
                        newArray[foundCounter++] = array[i];
                    }
                }
            } else {
                for (var i = 0; i < array.length; i++) {
                    if (property) {
                        var sFind = MCNEXT.Utils.readProperty(array[i], property.split('.'));
                    } else {
                        var sFind = array[i];
                    }

                    if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                        sMatchedItems += "|" + sFind + "|";
                        newArray[foundCounter++] = array[i];
                    }
                }
            }
            return newArray;
        };


        MCNEXT.Utils.getDistinctPropertyValues = function (array, property, ignorecase) {
            return Utils.distinctArray(array, property, ignorecase).map(function (item) {
                return MCNEXT.Utils.readProperty(item, property.split('.'));
            });
        };

        /**
         * Remove all accented characters from a string and replace them with their non-accented counterpart
         * @param {string} s
         * @returns {string}
         */
        MCNEXT.Utils.removeAccents = function (s) {
            var r = s.toLowerCase();
            r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
            r = r.replace(new RegExp("æ", 'g'), "ae");
            r = r.replace(new RegExp("ç", 'g'), "c");
            r = r.replace(new RegExp("[èéêë]", 'g'), "e");
            r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
            r = r.replace(new RegExp("ñ", 'g'), "n");
            r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
            r = r.replace(new RegExp("œ", 'g'), "oe");
            r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
            r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
            return r;
        };

        /**
         * remove a page from navigation history
         * @param {string} pageLocation page url
         */
        MCNEXT.Utils.removePageFromHistory = function (pageLoc) {
            var history = [];
            if (WinJS.Navigation.history && WinJS.Navigation.history.backStack && WinJS.Navigation.history.backStack.length) {
                WinJS.Navigation.history.backStack.forEach(function (page) {
                    if (page.location !== pageLoc) {
                        history.push(page);
                    }
                });
            }
            WinJS.Navigation.history.backStack = history;
        };

        /**
         * format a number on 2 characters
         * @param {number} number
         */
        MCNEXT.Utils.pad2 = function (number) {
            return (number < 10 ? '0' : '') + number;
        };

        /**
         * truncate a string and add ellipse if text if greater than certain size
         * @param {string} text text to truncate
         * @param {number} maxSize maximum size for text
         * @param {boolean} useWordBoundary indicate if truncate should happen on the closest word boundary (like space)
         */
        MCNEXT.Utils.ellipsisizeString = function (text, maxSize, useWordBoundary) {
            if (!text) {
                return '';
            }
            var toLong = text.length > maxSize, text_ = toLong ? text.substr(0, maxSize - 1) : text;
            text_ = useWordBoundary && toLong ? text_.substr(0, text_.lastIndexOf(' ')) : text_;
            return toLong ? text_ + '...' : text_;
        };

        /**
         * generate a new Guid
         * @returns {string}
         */
        MCNEXT.Utils.guid = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        };

        MCNEXT.Utils.inherit = function (element, property) {
            if (element && element.parentElement) {
                var current = element.parentElement;
                while (current) {
                    if (current.winControl) {
                        if (current.winControl[property] != undefined) {
                            return current.winControl[property];
                        }
                    }
                    current = current.parentElement;
                }
            }
        };

        /**
         * move DOM childrens form one node to the other
         * @param {HTMLElement} source source node containing elements to move
         * @param {HTMLElement} target target node for moved elements
         */
        MCNEXT.Utils.moveChilds = function (source, target) {
            var childs = [];
            for (var i = 0; i < source.children.length; i++) {
                childs.push(source.children[i]);
            }
            childs.forEach(function (elt) {
                target.appendChild(elt);
            });
        };

        MCNEXT.Utils.getParent = function (property, element) {
            var current = element.parentNode;

            while (current) {
                if (current[property] && current.winControl) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        };

        MCNEXT.Utils.getParentControlByClass = function (className, element) {
            var current = element.parentNode;

            while (current) {
                if (current.classList.contains(className) && current.winControl) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        };

        MCNEXT.Utils.getParentPage = function (element) {
            var current = element.parentNode;

            while (current) {
                if (current.mcnPage) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        };

        MCNEXT.Utils.getScopeControl = function (element) {
            var current = element.parentNode;

            while (current) {
                if (current.msParentSelectorScope) {
                    var scope = current.parentNode;
                    if (scope) {
                        var scopeControl = scope.winControl;
                        if (scopeControl) {
                            return scopeControl;

                        }
                        //var scopeParent = scope.parentNode;
                        //var scopeParentControl = scopeParent.winControl;
                    }
                }
                current = current.parentNode;
            }
        };

        MCNEXT.Utils.getTemplate = function (template) {
            if (template) {
                var templatetype = typeof template;
                if (templatetype == 'string') {
                    return new WinJS.Binding.Template(null, { href: template });
                }
                if (templatetype == 'function') {
                    return {
                        render: function (data, elt) {
                            var res = template(data, elt);
                            return WinJS.Promise.as(res);
                        }
                    };
                } else if (template.winControl) {
                    return template.winControl;
                } else if (template.render) {
                    return template;
                }
            }
        };

        MCNEXT.Utils.resolveMethod = function (element, text) {
            var res = Utils.resolveValue(element, text);
            if (res && typeof res == 'function')
                return res;

            return undefined;
        };

        MCNEXT.Utils.readValue = function (element, text) {
            var res = Utils.resolveValue(element, text);
            if (res) {
                if (typeof res == 'function')
                    return res(element);
                else
                    return res;
            }
            return undefined;
        };

        MCNEXT.Utils.resolveValue = function (element, text) {
            var methodName, control, method;

            if (text.indexOf('page:') == 0) {
                methodName = text.substr(5);
                if (MCNEXT.Utils.getParentPage) {
                    control = MCNEXT.Utils.getParentPage(element);
                }
                if (!control && MCNEXT.UI.Application.navigator) {
                    control = MCNEXT.UI.Application.navigator.pageControl;
                }

                if (!control)
                    return;

                method = MCNEXT.Utils.readProperty(control, methodName);
                if (method && typeof method == 'function')
                    method = method.bind(control);
            } else if (text.indexOf('ctrl:') == 0) {
                methodName = text.substr(5);
                control = MCNEXT.Utils.getScopeControl(element);
                method = MCNEXT.Utils.readProperty(control, methodName);
                if (method && typeof method == 'function')
                    method = method.bind(control);
            } else {
                methodName = text;
                control = MCNEXT.Utils.getScopeControl(element);
                method = MCNEXT.Utils.readProperty(window, methodName);
            }

            //if (method && typeof method == 'function')
            return method;

            //return null;
        };

        

        /**
         * Checks in a safe way if an object has a value, which could be 'false', '0' or '""'
         * @param {Object} item The object to check.
         * @returns {Boolean} Whether the object has a value or not.
         */
        MCNEXT.Utils.hasValue = function (item) {
            return typeof item !== "undefined" && item !== null;
        };

        /**
         * format error from an xhr call
         */
        MCNEXT.Utils.formatXHRError = function (xhr) {
            return "{0} - {1}: {2}".format(xhr.status, xhr.statusText, xhr.responseText);
        };

        /**
         * Unwraps the real error from a WinJS.Promise.join operation, which by design returns an array with 'undefined' for all cells,
         * excepts the one corresponding to the promise that really faulted.
         * @param {function} errorCallback The callback to use to handle the error.
         * @returns {Function} The result of the callback being fired with the real error.
         */
        MCNEXT.Utils.unwrapJoinError = function (errorCallback) {

            return function (errorArray) {
                var unwrappedError = null;
                for (var i = 0; i < errorArray.length; i++) {
                    var tentativeError = errorArray[i];
                    if (typeof tentativeError !== "undefined") {
                        unwrappedError = tentativeError;
                        break;
                    }
                }

                return errorCallback(unwrappedError);
            };
        };
    })(MCNEXT.Utils);

})(MCNEXT);

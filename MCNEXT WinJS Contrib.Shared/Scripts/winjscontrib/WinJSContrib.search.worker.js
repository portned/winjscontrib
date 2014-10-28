﻿//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

//module for managing multithreading in the search engine

/// <reference path="WinJSContrib.core.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />

var worker = this;
(function () {
    'use strict';

    importScripts('//Microsoft.WinJS.2.0/js/base.js');
    importScripts('/scripts/winjscontrib/winjscontrib.core.js');
    importScripts('/scripts/winjscontrib/winjscontrib.messenger.js');
    importScripts('/scripts/winjscontrib/WinJSContrib.search.js');

    var idx = new WinJSContrib.Search.Index();
    var messenger = new WinJSContrib.Messenger(worker, worker);

    messenger.init = function (arg) {
        idx.name = arg.name;
        idx.definition = arg.definition;
        if (arg.load) {
            return idx.load();
        }
    }

    messenger.save = function (data) {
        if (!idx.name || !idx.definition)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.save();
    }

    messenger.load = function (data) {
        if (!idx.name || !idx.definition)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.load();
    }

    messenger.index = function (data) {
        
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                if (data.options.index) {
                    idx.name = data.options.index.name;
                    if (data.options.index.definition) {
                        idx.definition = data.options.index.definition;
                    }
                }

                if (!idx.name || !idx.definition) {
                    error({ message: 'index not initialized' });
                    return 
                }

                if (data.options.load) {
                    var p = idx.load();
                }
                else {
                    var p = WinJS.Promise.wrap();
                }
                
                p.done(function () {
                    var indexed = idx.addRange(data.items);

                    if (data.options.save) {
                        idx.save().done(function () {
                            complete({ name: idx.name, items: indexed });
                        },error);
                    }
                    else {
                        complete({ name: idx.name, items: indexed });
                    }
                },error);
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    messenger.search = function (data) {
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                if (data.options.index) {
                    idx.name = data.options.index.name;
                    if (data.options.index.definition) {
                        idx.definition = data.options.index.definition;
                    }
                }

                if (!idx.name || !idx.definition) {
                    error({ message: 'index not initialized' });
                    return
                }

                if (data.options.load) {
                    var p = idx.load();
                }
                else {
                    var p = WinJS.Promise.wrap();
                }

                p.done(function () {
                    var res = idx.search(data.searchTerm);
                    complete(res);
                }, error);
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    messenger.clear = function (arg) {
        if (!idx.name || !idx.definition)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.clear();
    }
})();
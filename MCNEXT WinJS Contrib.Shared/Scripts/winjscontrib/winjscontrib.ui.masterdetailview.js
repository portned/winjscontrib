﻿/// <reference path="winjscontrib.core.js" />

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        MasterDetailView: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            options.orientation = options.orientation || 'horizontal';
            options.headerBehavior = options.headerBehavior || 'back';
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-layout-ctrl');
            
            this.element.classList.add('mcn-masterdetailview');
            this._initContent();

            WinJS.UI.setOptions(this, options);
            if (this.mediaTrigger) {
                this.mediaTrigger.check();
            }
        }, {
            orientation: {
                get: function () {
                    return this._orientation;
                },
                set: function (val) {
                    this._orientation = val;
                    this.element.classList.remove('mcn-vertical');
                    this.element.classList.remove('mcn-horizontal');
                    if (val == 'vertical' || val == 'horizontal')
                        this.element.classList.add('mcn-' + val);
                }
            },

            orientations: {
                get: function () {
                    return this._orientations;
                },
                set: function (val) {
                    this._orientations = val;
                    if (this.mediaTrigger) {
                        this.mediaTrigger.dispose();
                        this.mediaTrigger = null;
                    }
                    if (val) {
                        this.mediaTrigger = new WinJSContrib.UI.MediaTrigger(val, this);
                    }
                }
            },

            uri: {
                get: function () {
                    return this._uri;
                },
                set: function (val) {
                    var ctrl = this;
                    ctrl._uri = val;
                    if (ctrl.masterViewContent) {
                        $(ctrl.masterViewContent.element).remove();
                    }

                    WinJSContrib.UI.renderFragment(ctrl.masterView, val, null, {
                        onfragmentinit: function (masterCtrl) {
                            masterCtrl.masterDetailView = ctrl;
                            ctrl.masterViewContent = masterCtrl;
                        }
                    });
                }
            },

            _initContent: function () {
                var ctrl = this;
                ctrl.masterView = document.createElement('DIV');
                ctrl.masterView.className = 'mcn-masterdetailview-master visible';
                WinJSContrib.Utils.moveChilds(ctrl.element, ctrl.masterView);
                ctrl.element.appendChild(ctrl.masterView);

                ctrl.detailView = document.createElement('DIV');
                ctrl.detailView.className = 'mcn-masterdetailview-detail';
                ctrl.element.appendChild(ctrl.detailView);

                ctrl.detailViewHeader = document.createElement('DIV');
                ctrl.detailViewHeader.className = 'mcn-masterdetailview-detail-header';
                ctrl.detailView.appendChild(ctrl.detailViewHeader);

                ctrl.detailViewContent = document.createElement('DIV');
                ctrl.detailViewContent.className = 'mcn-masterdetailview-detail-content';
                ctrl.detailView.appendChild(ctrl.detailViewContent);
            },

            _defaultHeaderTemplate: function () {
                return {
                    render: function (data, container) {
                        return new WinJS.Promise(function (c, e) {
                            var header = document.createElement('DIV');
                            header.className = 'mcn-masterdetailview-defaultheader';
                            var headerBack = document.createElement('DIV');
                            headerBack.className = 'back';
                            header.appendChild(headerBack);
                            var headerTitle = document.createElement('DIV');
                            headerTitle.className = 'title';
                            if (data)
                                headerTitle.innerText = data.title;
                            header.appendChild(headerTitle);
                            if (container) container.appendChild(header);
                            c(header);
                        });
                    }
                }
            },


            _renderDetailHeader: function (data, options) {
                var ctrl = this;
                ctrl.detailViewHeader.innerHTML = '';
                var template = ctrl.headerTemplate || ctrl._defaultHeaderTemplate();
                return template.render(data, ctrl.detailViewHeader).then(function (rendered) {
                    if (options && options.prepareHeader) {
                        options.prepareHeader({ header: ctrl.detailViewHeader });
                    }

                    if (ctrl.headerBehavior == 'back') {
                        $(rendered).tap(function () {
                            ctrl.returnToMaster();
                        })
                    }

                    return rendered;
                });
            },

            _clearDetailContent: function () {
                var ctrl = this;
                if (ctrl.detailViewContentCtrl) {
                    if (ctrl.detailViewContentCtrl.unload)
                        ctrl.detailViewContentCtrl.unload();
                    if (ctrl.detailViewContentCtrl.dispose)
                        ctrl.detailViewContentCtrl.dispose();
                    $(ctrl.detailViewContentCtrl.element).remove();
                    ctrl.detailViewContentCtrl = null;
                }
                ctrl.detailViewContent.innerHTML = '';
            },

            _loadDetailContent: function (uri, data, options) {
                var ctrl = this;
                ctrl._clearDetailContent();

                if (options.wrapInMasterDetailView) {
                    var elt = document.createElement('DIV');
                    elt.style.width = "100%";
                    elt.style.height = "100%";

                    ctrl.detailViewContentCtrl = new WinJSContrib.UI.MasterDetailView(elt, { uri: uri, parent: ctrl, orientation: ctrl.orientation, orientations: ctrl.orientations });
                    ctrl.detailViewContent.appendChild(elt);
                    return WinJS.Promise.wrap();
                }

                return WinJSContrib.UI.renderFragment(ctrl.detailViewContent, uri, data, {
                    onfragmentinit: function (detailCtrl) {
                        detailCtrl.masterDetailView = ctrl;
                        ctrl.detailViewContentCtrl = detailCtrl;
                    }
                });
            },

            _animateToDetail: function (element, data, options) {
                var ctrl = this;

                if (ctrl.morph)
                    ctrl.morph.dispose();

                var morph = WinJSContrib.UI.Morph.from(element);
                ctrl.morph = morph;
                ctrl.detailViewContent.style.opacity = '0';
                ctrl.detailViewContent.style.display = 'none';


                //                ctrl.detailViewContent.style.opacity = '0';

                return morph.fadeIn(100).then(function () {
                    WinJSContrib.UI.Animation.fadeOut(ctrl.masterView, 160).then(function () {
                        ctrl.masterView.style.opacity = '';
                        ctrl.masterView.classList.remove('visible');
                    });


                    morph.morphToElt(ctrl.detailViewHeader);
                    ctrl.detailViewHeader.style.opacity = '0';
                    ctrl.detailViewContent.style.display = '';
                    ctrl.detailView.classList.add('visible');

                    //WinJSContrib.UI.Animation.enterPage(ctrl.detailViewContent, 700, { delay: 470 });

                    return morph.apply({ duration: 500 }).then(function () {
                        return ctrl._loadDetailContent(options.uri, data, options).then(function () {
                            WinJSContrib.UI.Animation.enterPage(ctrl.detailViewContent, 700);
                            ctrl.detailViewHeader.style.opacity = '';
                            return morph.fadeOut(250);
                        });
                    });
                });
            },

            _animateToMaster: function () {
                var ctrl = this;
                ctrl.morph.checkTarget(true);
                ctrl.morph.fadeIn(160);
                return WinJSContrib.UI.Animation.fadeOut(ctrl.detailView, 250).then(function () {
                    ctrl.detailView.classList.remove('visible');
                    ctrl.detailView.style.display = 'none';
                }).then(function () {
                    ctrl.masterView.classList.add('visible');
                    ctrl.masterView.style.opacity = '0';
                    
                    ctrl.morph.revert({ duration: 300 });
                    return WinJSContrib.UI.Animation.fadeIn(ctrl.masterView, 350, { delay: 250 });
                }).then(function () {
                    return ctrl.morph.fadeOut(90);
                }).then(function () {
                    ctrl.detailView.style.display = '';
                    ctrl.detailView.style.opacity = '';
                    ctrl._clearDetailContent();
                    ctrl.morph.dispose();
                    ctrl.morph = null;
                });
            },

            openDetail: function (element, data, options) {
                var ctrl = this;

                return ctrl._renderDetailHeader(data, options).then(function (rendered) {
                    return ctrl._animateToDetail(element, data, options);
                    //if (options.uri) {
                    //    ctrl._loadDetailContent(options.uri, data);
                    //}
                });
            },

            returnToMaster: function () {
                var ctrl = this;

                ctrl._animateToMaster().then(function () {
                    ctrl._clearDetailContent();
                });
            },

            dispose: function () {
                if (this.mediaTrigger) {
                    this.mediaTrigger.dispose();
                    this.mediaTrigger = null;
                }
                this._clearDetailContent();
                WinJS.Utilities.disposeSubTree(this.element);
            },

            updateLayout: function (e) {
                var ctrl = this;
                if (ctrl.masterViewContent && ctrl.masterViewContent.updateLayout) {
                    ctrl.masterViewContent.updateLayout(e);
                }
                if (ctrl.detailViewContentCtrl && ctrl.detailViewContentCtrl.updateLayout) {
                    ctrl.detailViewContentCtrl.updateLayout(e);
                }
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("myevent"))
    });
})();
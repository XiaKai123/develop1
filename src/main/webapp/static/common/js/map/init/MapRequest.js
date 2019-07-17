/**
* @描述：公共请求方法
**/
var GuoDi = {};
 GuoDi.Map = {};
 GuoDi.Map.Util = {};
 GuoDi.Map.ProxyHost = "proxy.jsp";
 GuoDi.Map._scriptName = "static/common/js/map/init/MapRequest.js";
 GuoDi.Map.Util.applyDefaults = function(g, h){
    g = g ||
    {};
    var e = typeof window.Event == "function" && h instanceof window.Event;
    for (var f in h) {
        if (g[f] === undefined || (!e && h.hasOwnProperty && h.hasOwnProperty(f) && !g.hasOwnProperty(f))) {
            g[f] = h[f]
        }
    }
    if (!e && h && h.hasOwnProperty && h.hasOwnProperty("toString") && !g.hasOwnProperty("toString")) {
        g.toString = h.toString
    }
    return g
};
 GuoDi.Map.Util.getParameterString = function(p){
    var q = [];
    for (var k in p) {
        var l = p[k];
        if ((l != null) && (typeof l != "function")) {
            var o;
            if (typeof l == "object" && l.constructor == Array) {
                var n = [];
                var j;
                for (var r = 0, m = l.length; r < m; r++) {
                    j = l[r];
                    n.push(encodeURIComponent((j === null || j === undefined) ? "" : j))
                }
                o = n.join(",")
            }
            else {
                o = encodeURIComponent(l)
            }
            q.push(encodeURIComponent(k) + "=" + o)
        }
    }
    return q.join("&")
};
 GuoDi.Map.Util.upperCaseObject = function (object) {
    var uObject = {};
    for (var key in object) {
        uObject[key.toUpperCase()] = object[key];
    }
    return uObject;
};
 GuoDi.Map.Util.extend = function(g, h){
    g = g ||
    {};
    if (h) {
        for (var i in h) {
            var j = h[i];
            if (j !== undefined) {
                g[i] = j
            }
        }
        var f = typeof window.Event == "function" && h instanceof window.Event;
        if (!f && h.hasOwnProperty && h.hasOwnProperty("toString")) {
            g.toString = h.toString
        }
    }
    return g
};
 GuoDi.Map.Request = {
    scriptLocation: null,
    DEFAULT_CONFIG: {
        method: "GET",
        url: window.location.href,
        async: true,
        user: undefined,
        password: undefined,
        params: null,
        proxy:  GuoDi.Map.ProxyHost,
        headers: {},
        data: null,
        callback: function(){
        },
        success: null,
        failure: null,
        scope: null
    },
    getScriptLocation: function(){
        if (this.scriptLocation != undefined) {
            return this.scriptLocation
        }
        this.scriptLocation = "";
        var f = new RegExp("(^|(.*?\\/))(" +  GuoDi.Map._scriptName + ")(\\?|$)");
        var b = document.getElementsByTagName("script");
        for (var d = 0, a = b.length; d < a; d++) {
            var e = b[d].getAttribute("src");
            if (e) {
                var c = e.match(f);
                if (c) {
                    this.scriptLocation = c[1];
                    break
                }
            }
        }
        return this.scriptLocation
    },
    issue: function(q){
        var n =  GuoDi.Map.Util.extend(this.DEFAULT_CONFIG, {
            proxy:  GuoDi.Map.ProxyHost
        });
        q =  GuoDi.Map.Util.applyDefaults(q, n);
        var o = new  GuoDi.Map.Request.XMLHttpRequest();
        var r = q.url;
        if (q.params) {
            var p =  GuoDi.Map.Util.getParameterString(q.params);
            if (p.length > 0) {
                var l = (r.indexOf("?") > -1) ? "&" : "?";
                r += l + p
            }
        }
        if (q.proxy && (r.indexOf("http") == 0)) {
            if (typeof q.proxy == "function") {
                r = q.proxy(r)
            }
            else {
                r = this.getScriptLocation() + q.proxy + "?" + encodeURIComponent(r)
            }
        }
        o.open(q.method, r, q.async, q.user, q.password);
        for (var m in q.headers) {
            o.setRequestHeader(m, q.headers[m])
        }
        var j = this.events;
        var k = this;
        o.onreadystatechange = function(){
            if (o.readyState ==  GuoDi.Map.Request.XMLHttpRequest.DONE) {
                if (!o.status || (o.status >= 200 && o.status < 300)) {
                    if (q.success) {
                        q.success(o.responseText)
                    }
                }
                if (o.status && (o.status < 200 || o.status >= 300)) {
                    if (q.failure) {
                        q.failure(o.responseText)
                    }
                }
            }
        };
        if (q.async === false) {
            o.send(q.data)
        }
        else {
            window.setTimeout(function(){
                o.send(q.data)
            }, 0)
        }
        return o
    },
    GET: function(b){
        b =  GuoDi.Map.Util.extend(b, {
            method: "GET"
        });
        return  GuoDi.Map.Request.issue(b)
    },
    POST: function(b){
        b =  GuoDi.Map.Util.extend(b, {
            method: "POST"
        });
        b.headers = b.headers ? b.headers : {};
        if (!("CONTENT-TYPE" in  GuoDi.Map.Util.upperCaseObject(b.headers))) {
            b.headers["Content-Type"] = "application/xml"
        }
        return  GuoDi.Map.Request.issue(b)
    },
    PUT: function(b){
        b =  GuoDi.Map.Util.extend(b, {
            method: "PUT"
        });
        b.headers = b.headers ? b.headers : {};
        if (!("CONTENT-TYPE" in  GuoDi.Map.Util.upperCaseObject(b.headers))) {
            b.headers["Content-Type"] = "application/xml"
        }
        return  GuoDi.Map.Request.issue(b)
    },
    DELETE: function(b){
        b =  GuoDi.Map.Util.extend(b, {
            method: "DELETE"
        });
        return  GuoDi.Map.Request.issue(b)
    },
    HEAD: function(b){
        b =  GuoDi.Map.Util.extend(b, {
            method: "HEAD"
        });
        return  GuoDi.Map.Request.issue(b)
    },
    OPTIONS: function(b){
        b =  GuoDi.Map.Util.extend(b, {
            method: "OPTIONS"
        });
        return  GuoDi.Map.Request.issue(b)
    }
};
(function(){
    var o = window.XMLHttpRequest;
    var k = !!window.controllers, n = window.document.all && !window.opera;
    function p(){
        this._object = o ? new o : new window.ActiveXObject("Microsoft.XMLHTTP")
    }
    if (k && o.wrapped) {
        p.wrapped = o.wrapped
    }
    p.UNSENT = 0;
    p.OPENED = 1;
    p.HEADERS_RECEIVED = 2;
    p.LOADING = 3;
    p.DONE = 4;
    p.prototype.readyState = p.UNSENT;
    p.prototype.responseText = "";
    p.prototype.responseXML = null;
    p.prototype.status = 0;
    p.prototype.statusText = "";
    p.prototype.onreadystatechange = null;
    p.onreadystatechange = null;
    p.onopen = null;
    p.onsend = null;
    p.onabort = null;
    p.prototype.open = function(b, g, c, f, d){
        this._async = c;
        var h = this, a = this.readyState;
        if (n) {
            var e = function(){
                if (h._object.readyState != p.DONE) {
                    j(h)
                }
            };
            if (c) {
                window.attachEvent("onunload", e)
            }
        }
        this._object.onreadystatechange = function(){
            if (k && !c) {
                return
            }
            h.readyState = h._object.readyState;
            l(h);
            if (h._aborted) {
                h.readyState = p.UNSENT;
                return
            }
            if (h.readyState == p.DONE) {
                j(h);
                if (n && c) {
                    window.detachEvent("onunload", e)
                }
            }
            if (a != h.readyState) {
                m(h)
            }
            a = h.readyState
        };
        if (p.onopen) {
            p.onopen.apply(this, arguments)
        }
        this._object.open(b, g, c, f, d);
        if (!c && k) {
            this.readyState = p.OPENED;
            m(this)
        }
    };
    p.prototype.send = function(a){
        if (p.onsend) {
            p.onsend.apply(this, arguments)
        }
        if (a && a.nodeType) {
            a = window.XMLSerializer ? new window.XMLSerializer().serializeToString(a) : a.xml;
            if (!this._headers["Content-Type"]) {
                this._object.setRequestHeader("Content-Type", "application/xml")
            }
        }
        this._object.send(a);
        if (k && !this._async) {
            this.readyState = p.OPENED;
            l(this);
            while (this.readyState < p.DONE) {
                this.readyState++;
                m(this);
                if (this._aborted) {
                    return
                }
            }
        }
    };
    p.prototype.abort = function(){
        if (p.onabort) {
            p.onabort.apply(this, arguments)
        }
        if (this.readyState > p.UNSENT) {
            this._aborted = true
        }
        this._object.abort();
        j(this)
    };
    p.prototype.getAllResponseHeaders = function(){
        return this._object.getAllResponseHeaders()
    };
    p.prototype.getResponseHeader = function(a){
        return this._object.getResponseHeader(a)
    };
    p.prototype.setRequestHeader = function(b, a){
        if (!this._headers) {
            this._headers = {}
        }
        this._headers[b] = a;
        return this._object.setRequestHeader(b, a)
    };
    p.prototype.toString = function(){
        return "[object XMLHttpRequest]"
    };
    p.toString = function(){
        return "[XMLHttpRequest]"
    };
    function m(a){
        if (a.onreadystatechange) {
            a.onreadystatechange.apply(a)
        }
        if (p.onreadystatechange) {
            p.onreadystatechange.apply(a)
        }
    }
    function i(a){
        var b = a.responseXML;
        if (n && b && !b.documentElement && a.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
            b = new ActiveXObject("Microsoft.XMLDOM");
            b.loadXML(a.responseText)
        }
        if (b) {
            if ((n && b.parseError != 0) || (b.documentElement && b.documentElement.tagName == "parsererror")) {
                return null
            }
        }
        return b
    }
    function l(b){
        try {
            b.responseText = b._object.responseText
        } 
        catch (a) {
        }
        try {
            b.responseXML = i(b._object)
        } 
        catch (a) {
        }
        try {
            b.status = b._object.status
        } 
        catch (a) {
        }
        try {
            b.statusText = b._object.statusText
        } 
        catch (a) {
        }
    }
    function j(a){
        a._object.onreadystatechange = new window.Function;
        delete a._headers
    }
    if (!window.Function.prototype.apply) {
        window.Function.prototype.apply = function(b, a){
            if (!a) {
                a = []
            }
            b.__func = this;
            b.__func(a[0], a[1], a[2], a[3], a[4]);
            delete b.__func
        }
    }
     GuoDi.Map.Request.XMLHttpRequest = p
})();

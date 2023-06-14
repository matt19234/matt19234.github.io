
{
    const moduleExports = {};

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const items = obj => {
        const result = [];

        for (let key in obj) {
            if (obj.hasOwnProperty (key)) {
                result.push([key, obj[key]]);
            }
        }

        return result;
    };

    moduleExports.items = items;

    const unitems = list => {
        const result = {};

        for (let [key, value] of list) {
            result[key] = value;
        }

        return result;
    };

    moduleExports.unitems = unitems;

    const map = f => list => list.map(f);

    moduleExports.map = map;

    const compose = f => g => x => f(g(x));

    moduleExports.compose = compose;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const tau = 2 * Math.PI;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const addAsset = ([name, assetPromise]) =>
        assetPromise.then(asset => [name, asset]);

    const loadAll = assets =>
        Promise.all(map (addAsset) (items (assets))).then(unitems);

    moduleExports.loadAll = loadAll;

    const loadImage = url =>
        new Promise((fulfill, reject) => {
            const image = new Image();

            image.onload = () => {
                fulfill(image);
            };

            image.src = url;
        });

    moduleExports.loadImage = loadImage;

    const loadAudioMedia = url =>
        new Promise((fulfill, reject) => {
            const audio = new Audio();

            audio.oncanplay = () => {
                fulfill(audio);
            };

            audio.src = url;
        });

    moduleExports.loadAudioMedia = loadAudioMedia;

    const loadAudioBuffer = ctx => url =>
        new Promise((fulfill, reject) => {
            const request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";

            request.onload = () => {
                ctx.decodeAudioData(request.response, buffer => {
                    if (buffer) {
                        fulfill (buffer);
                    }

                    else {
                        reject (new Error("Error decoding file data: " + url));
                    }
                }, error => reject (error));
            };

            request.onerror = function() {
                reject("Audio failed to load.");
            };

            request.send();
        });

    moduleExports.loadAudioBuffer = loadAudioBuffer;

    const loadJSON = url =>
        new Promise((fulfill, reject) => {
            const httpRequest = new XMLHttpRequest();

            const httpResponseOk = 200;
            const readyStateDone = 4;

            httpRequest.onreadystatechange = () => {
                if ( httpRequest.readyState === readyStateDone &&
                     httpRequest.status === httpResponseOk
                   ) {
                    fulfill (JSON.parse (httpRequest.responseText));
                }
            };

            httpRequest.open("GET", url);
            httpRequest.send();
        });

    moduleExports.loadJSON = loadJSON;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const eventTypes =
        Object.freeze ({ "key": 0
                       , "click": 1
                       });

    moduleExports.eventTypes = eventTypes;

    const Key = key => down =>
        ({ "type": eventTypes.key
         , "key": key
         , "down": down
         });

    const Click = id =>
        ({ "type": eventTypes.click
         , "id": id
         });

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const Game = initialState => render => react => update =>
        ({ "initialState": initialState
         , "render": render
         , "react": react
         , "update": update
         });

    moduleExports.Game = Game;

    const runGame = fps => minFps => targetElement => ctx => game => {
        const maxTimestep = 1 / minFps;
        const timestep = 1 / fps;

        let accumulator = 0;

        const eventQueue = [];

        let currentNode = null;
        let previousNode = null;

        const keysPressed = {};

        window.addEventListener("keydown", ({ keyCode }) => {
            if (keysPressed[keyCode] === undefined) {
                keysPressed[keyCode] = true;

                eventQueue.push(Key (keyCode) (true));
            }
        }, false);

        window.addEventListener("keyup", ({ keyCode }) => {
            delete keysPressed[keyCode];

            eventQueue.push(Key (keyCode) (false));
        }, false);

        const render = drawing => {
            if (drawing.type === drawingTypes.rect) {
                if (ctx.fillStyle !== drawing.color) {
                    ctx.fillStyle = drawing.color;
                }

                ctx.fillRect ( drawing.pos[0]
                             , drawing.pos[1]
                             , drawing.size[0]
                             , drawing.size[1]
                             );
            }

            else if (drawing.type === drawingTypes.circle) {
                if (ctx.fillStyle !== drawing.color) {
                    ctx.fillStyle = drawing.color;
                }

                ctx.beginPath ();
                ctx.arc ( drawing.pos[0]
                        , drawing.pos[1]
                        , drawing.radius
                        , 0
                        , tau
                        );
                ctx.fill ();
            }

            else if (drawing.type === drawingTypes.picture) {
                ctx.drawImage ( drawing.image
                              , drawing.pos[0]
                              , drawing.pos[1]
                              , drawing.size[0]
                              , drawing.size[1]
                              );
            }

            else if (drawing.type === drawingTypes.drawings) {
                for (let subDrawing of drawing.drawings) {
                    render (subDrawing);
                }
            }

            else if (drawing.type === drawingTypes.html) {
                if (currentNode === null) {
                    currentNode = drawing.html;

                    if (previousNode === null || !equalNodes (currentNode, previousNode)) {
                        while (targetElement.firstChild) {
                            targetElement.removeChild (targetElement.firstChild);
                        }

                        targetElement.appendChild (createNode (drawing.html, signal => {
                            eventQueue.push(Click (signal));
                        }));
                    }
                }
            }
        };

        const frame = lastTime => lastState => () => {
            const currentTime = performance.now ();

            const msPerS = 1000;

            const dt = (currentTime - lastTime) / msPerS;

            accumulator += Math.min(dt, maxTimestep);

            let state = lastState;

            for (let event of eventQueue) {
                state = game.react (event) (state);
            }

            eventQueue.length = 0;

            while (accumulator >= timestep) {
                accumulator -= timestep;

                state = game.update (timestep) (state);
            }

            ctx.clearRect ( 0
                          , 0
                          , ctx.canvas.width
                          , ctx.canvas.height
                          );

            currentNode = null;

            render (game.render (state));

            previousNode = currentNode;

            requestAnimationFrame (frame (currentTime) (state));
        };

        frame (performance.now ()) (game.initialState) ();
    };

    moduleExports.runGame = runGame;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const keysPressed = {};

    const keyStates =
        Object.freeze ({ "pressed"  : 0
                       , "unpressed": 1
                       , "cancelled": 2
                       });

    moduleExports.keyStates = keyStates;

    window.addEventListener("keydown", ({ keyCode }) => {
        if (keysPressed[keyCode] !== keyStates.cancelled) {
            keysPressed[keyCode] = keyStates.pressed;
        }
    }, false);

    window.addEventListener("keyup", ({ keyCode }) => {
        keysPressed[keyCode] = keyStates.unpressed;
    }, false);

    const isKeyPressed = key => keysPressed[key] === keyStates.pressed;

    moduleExports.isKeyPressed = isKeyPressed;

    const getKeyState = key =>
        keysPressed[key] === undefined ? keyStates.unpressed : keysPressed[key];

    moduleExports.getKeyState = getKeyState;

    const cancelKey = key => {
        keysPressed[key] = keyStates.cancelled;
    };

    moduleExports.cancelKey = cancelKey;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    moduleExports.H = {};

    const nodeTypes =
        Object.freeze({ "div": "div"
                      , "h1": "h1"
                      , "h2": "h2"
                      , "h3": "h3"
                      , "h4": "h4"
                      , "h5": "h5"
                      , "h6": "h6"
                      , "p": "p"
                      , "span": "span"
                      , "button": "button"
                      , "text": "text"
                      });

    const VirtualNode = type => properties => events => children =>
        ({ "type": type
         , "properties": properties
         , "events": events
         , "children": children
         });

    const Txt = text =>
        ({ "type": nodeTypes.text
         , "text": text
         });

    moduleExports.H.Txt = Txt;

    const Div = VirtualNode (nodeTypes.div);
    const H1 = VirtualNode (nodeTypes.h1);
    const H2 = VirtualNode (nodeTypes.h2);
    const H3 = VirtualNode (nodeTypes.h3);
    const H4 = VirtualNode (nodeTypes.h4);
    const H5 = VirtualNode (nodeTypes.h5);
    const H6 = VirtualNode (nodeTypes.h6);
    const P = VirtualNode (nodeTypes.p);
    const Span = VirtualNode (nodeTypes.span);
    const Button = VirtualNode (nodeTypes.button);

    moduleExports.H.Div = Div;
    moduleExports.H.H1 = H1;
    moduleExports.H.H2 = H2;
    moduleExports.H.H3 = H3;
    moduleExports.H.H4 = H4;
    moduleExports.H.H5 = H5;
    moduleExports.H.H6 = H6;
    moduleExports.H.P = P;
    moduleExports.H.Span = Span;
    moduleExports.H.Button = Button;

    const Div$ = Div ({}) ({});
    const H1$ = H1 ({}) ({});
    const H2$ = H2 ({}) ({});
    const H3$ = H3 ({}) ({});
    const H4$ = H4 ({}) ({});
    const H5$ = H5 ({}) ({});
    const H6$ = H6 ({}) ({});
    const P$ = P ({}) ({});
    const Span$ = Span ({}) ({});
    const Button$ = Button ({}) ({});

    moduleExports.H.Div$ = Div$;
    moduleExports.H.H1$ = H1$;
    moduleExports.H.H2$ = H2$;
    moduleExports.H.H3$ = H3$;
    moduleExports.H.H4$ = H4$;
    moduleExports.H.H5$ = H5$;
    moduleExports.H.H6$ = H6$;
    moduleExports.H.P$ = P$;
    moduleExports.H.Span$ = Span$;
    moduleExports.H.Button$ = Button$;

    const createNode = (virtualNode, eventHandler) => {
        if (virtualNode.type === nodeTypes.text) {
            return document.createTextNode (virtualNode.text);
        }

        else {
            const node = document.createElement(virtualNode.type);

            for (let key of Object.keys(virtualNode.properties)) {
                node.setAttribute(key, virtualNode.properties[key]);
            }

            if (virtualNode.events.click !== undefined) {
                node.addEventListener("click", () => {
                    eventHandler(virtualNode.events.click);
                });
            }

            for (let child of virtualNode.children) {
                node.appendChild(createNode (child, eventHandler));
            }

            return node;
        }
    };

    const equalObjects = (a, b) => {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (let key of keysA) {
            if (a[key] !== b[key]) {
                return false;
            }
        }

        return true;
    };

    const equalLists = (a, b, eq) => {
        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0, length = a.length; i < length; i += 1) {
            if (!eq (a[i], b[i])) {
                return false;
            }
        }

        return true;
    };

    const equalNodes = (a, b) => {
        if (a.type !== b.type) {
            return false;
        }

        else if (a.type === nodeTypes.text) {
            return a.text === b.text;
        }

        else {
            return ( equalObjects (a.properties, b.properties) &&
                     equalObjects (a.events, b.events) &&
                     equalLists (a.children, b.children, equalNodes));
        }
    };

    const renderHtml = (state, virtualNode) => {

    };

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const drawingTypes =
        Object.freeze({ "rect": 0
                      , "circle": 1
                      , "picture": 2
                      , "drawings": 3
                      , "html": 4
                      });

    const Rect = pos => size => color =>
        ({ "type": drawingTypes.rect
         , "pos": pos
         , "size": size
         , "color": color
         });

    moduleExports.Rect = Rect;

    const Circle = pos => radius => color =>
        ({ "type": drawingTypes.circle
         , "pos": pos
         , "radius": radius
         , "color": color
         });

    moduleExports.Circle = Circle;

    const Picture = pos => size => image =>
        ({ "type": drawingTypes.picture
         , "pos": pos
         , "size": size
         , "image": image
         });

    moduleExports.Picture = Picture;

    const Drawings = drawings =>
        ({ "type": drawingTypes.drawings
         , "drawings": drawings
         });

    moduleExports.Drawings = Drawings;

    const Html = html =>
        ({ "type": drawingTypes.html
         , "html": html
         });

    moduleExports.Html = Html;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const Vec = x => y => ([x, y]);

    moduleExports.Vec = Vec;

    const scale = ([x, y]) => s => [x * s, y * s];

    moduleExports.scale = scale;

    const unscale = ([x, y]) => s => [x / s, y / s];

    moduleExports.unscale = unscale;

    const add = ([x1, y1]) => ([x2, y2]) => [x1 + x2, y1 + y2];

    moduleExports.add = add;

    const sub = ([x1, y1]) => ([x2, y2]) => [x1 - x2, y1 - y2];

    moduleExports.sub = sub;

    const dot = ([x1, y1]) => ([x2, y2]) => x1 * x2 + y1 * y2;

    moduleExports.dot = dot;

    const magnitude = ([x, y]) => Math.sqrt (x * x + y * y);

    moduleExports.magnitude = magnitude;

    const normal = ([x, y]) => {
        const magnitude = Math.sqrt (x * x + y * y);

        return magnitude === 0 ? null : [x / magnitude, y / magnitude];
    };

    moduleExports.normal = normal;

    const normalOrZero = ([x, y]) => {
        const magnitude = Math.sqrt (x * x + y * y);

        return magnitude === 0 ? zeroVec : [x / magnitude, y / magnitude];
    };

    moduleExports.normalOrZero = normalOrZero;

    const gte = ([x1, y1]) => ([x2, y2]) =>
        x1 * x1 + y1 * y1 >= x2 * x2 + y2 * y2;

    moduleExports.gte = gte;

    const lte = ([x1, y2]) => ([x2, y2]) =>
        x1 * x1 + y1 * y1 <= x2 * x2 + y2 * y2;

    moduleExports.lte = lte;

    const gt = ([x1, y2]) => ([x2, y2]) =>
        x1 * x1 + y1 * y1 > x2 * x2 + y2 * y2;

    moduleExports.gt = gt;

    const lt = ([x1, y2]) => ([x2, y2]) =>
        x1 * x1 + y1 * y1 < x2 * x2 + y2 * y2;

    moduleExports.lt = lt;

    const isZero = ([x, y]) => x === 0 && y === 0;

    moduleExports.isZero = isZero;

    const zeroVec = Vec (0) (0);

    moduleExports.zeroVec = zeroVec;

    const unitLeft = Vec (-1) (0);

    moduleExports.unitLeft = unitLeft;

    const unitUp = Vec (0) (-1);

    moduleExports.unitUp = unitUp;

    const unitRight = Vec (1) (0);

    moduleExports.unitRight = unitRight;

    const unitDown = Vec (0) (1);

    moduleExports.unitDown = unitDown;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const Body = pos => size => mass => vel => prevAcc => acc =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.Body = Body;

    const changeBodyPos = f => ({pos, size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : f (pos)
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.changeBodyPos = changeBodyPos;

    const setBodyPos = x => ({size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : x
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.setBodyPos = setBodyPos;

    const changeBodySize = f => ({pos, size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : f (size)
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.changeBodySize = changeBodySize;

    const setBodySize = x => ({pos, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : x
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.setBodySize = setBodySize;

    const changeBodyMass = f => ({pos, size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : f (mass)
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.changeBodyMass = changeBodyMass;

    const setBodyMass = x => ({pos, size, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : x
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.setBodyMass = setBodyMass;

    const changeBodyVel = f => ({pos, size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : f (vel)
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.changeBodyVel = changeBodyVel;

    const setBodyVel = x => ({pos, size, mass, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : x
         , "prevAcc": prevAcc
         , "acc"    : acc
         });

    moduleExports.setBodyVel = setBodyVel;

    const changeBodyPrevAcc = f => ({pos, size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": f (prevAcc)
         , "acc"    : acc
         });

    moduleExports.changeBodyPrevAcc = changeBodyPrevAcc;

    const setBodyPrevAcc = x => ({pos, size, mass, vel, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": x
         , "acc"    : acc
         });

    moduleExports.setBodyPrevAcc = setBodyPrevAcc;

    const changeBodyAcc = f => ({pos, size, mass, vel, prevAcc, acc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : f (acc)
         });

    moduleExports.changeBodyAcc = changeBodyAcc;

    const setBodyAcc = x => ({pos, size, mass, vel, prevAcc}) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : x
         });

    moduleExports.setBodyAcc = setBodyAcc;

    const integrateBody =
        dt =>
        ({ pos: [x, y]
         , size
         , mass
         , vel: [vx, vy]
         , prevAcc: [pax, pay]
         , acc: [ax, ay]
         }) =>
        ({ "pos"    : [x + (vx + pax * dt / 2) * dt, y + (vy + pay * dt / 2) * dt]
         , "size"   : size
         , "mass"   : mass
         , "vel"    : [vx + (pax + ax) / 2 * dt, vy + (pay + ay) / 2 * dt]
         , "prevAcc": [ax, ay]
         , "acc"    : zeroVec
         });

    moduleExports.integrateBody = integrateBody;

    const applyForce =
        ([fx, fy]) =>
        ({ pos
         , size
         , mass
         , vel
         , prevAcc
         , acc: [ax, ay]
         }) =>
        ({ "pos"    : pos
         , "size"   : size
         , "mass"   : mass
         , "vel"    : vel
         , "prevAcc": prevAcc
         , "acc"    : [ax + fx / mass, ay + fy / mass]
         });

    moduleExports.applyForce = applyForce;

    const areColliding = a => b =>
        (  a.pos[0] < b.pos[0] + b.size[0]
        && a.pos[0] + a.size[0] > b.pos[0]
        && a.pos[1] < b.pos[1] + b.size[1]
        && a.pos[1] + a.size[1] > b.pos[1]
        );

    moduleExports.areColliding = areColliding;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    const Bounds = origin => size =>
        ({ "origin": origin
         , "size": size
         });

    moduleExports.Bounds = Bounds;

    const containTo = ({origin, size}) => body => {
        const newPos =
            Vec (Math.min ( Math.max (body.pos[0], origin[0])
                          , origin[0] + size[0] - body.size[0]))
                (Math.min ( Math.max (body.pos[1], origin[1])
                          , origin[1] + size[1] - body.size[1]));

        return setBodyPos (newPos) (body);
    };

    moduleExports.containTo = containTo;

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

    window._ = moduleExports;
}

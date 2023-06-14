"use strict";

{
    const { compose
          , loadAll
          , loadImage
          , Vec
          , add
          , sub
          , scale
          , normalOrZero
          , gte
          , zeroVec
          , Picture
          , Html
          , Drawings
          , Body
          , H
          , makeRenderer
          , eventTypes
          , integrateBody
          , applyForce
          , applyMotion
          , areColliding
          , Bounds
          , containTo
          , Game
          , runGame
          } = _;

    console.log(_);

    const gameSpace = document.getElementById("game-space");

    const gameWidth = gameSpace.clientWidth;
    const gameHeight = gameSpace.clientHeight;

    const ui = document.getElementById("ui");

    const canvas = document.getElementById("canvas");
    canvas.width = gameSpace.clientWidth;
    canvas.height = gameSpace.clientHeight;

    const ctx = canvas.getContext("2d");

    loadAll({
        "ghost": loadImage("images/world/ghost.png"),
        "bomb" : loadImage("images/world/bomb.png"),
        "red"  : loadImage("images/world/red.png"),
        "blue" : loadImage("images/world/blue.png")
    }).then(assets => {
        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

        const bounds = Bounds (Vec (0) (0))
                              (Vec (gameWidth) (gameHeight));

        const contain = containTo (bounds);

        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

        const Player = image => name => direction => body => score =>
            ({ "image": image
             , "name": name
             , "direction": direction
             , "body": body
             , "score": score
             });

        const changePlayerBody = f => ({image, name, direction, body, score}) =>
            Player (image) (name) (direction) (f (body)) (score);

        const changePlayerScore = f => ({image, name, direction, body, score}) =>
            Player (image) (name) (direction) (body) (f (score));

        const changePlayerDirection = f => ({image, name, direction, body, score}) =>
            Player (image) (name) (f (direction)) (body) (score);

        const playerStrength = 5000;

        const playerFriction = 10;

        const playerSize = 64;

        const player1 =
            Player (assets.red)
                   ("Red")
                   (zeroVec)
                   (Body (Vec (0) (0))
                         (Vec (playerSize) (playerSize))
                         (1)
                         (zeroVec)
                         (zeroVec)
                         (zeroVec))
                   (0);

        const player2 =
            Player (assets.blue)
                   ("Blue")
                   (zeroVec)
                   (Body (Vec (gameWidth - playerSize) (0))
                         (Vec (playerSize) (playerSize))
                         (1)
                         (zeroVec)
                         (zeroVec)
                         (zeroVec))
                   (0);

        const reactPlayer = event => controls => player => {
            const k = event.down ? 1 : -1;

            return ( event.key === controls.left
                   ? changePlayerDirection (([x, y]) => [x - k, y]) (player)
                   : event.key === controls.up
                   ? changePlayerDirection (([x, y]) => [x, y - k]) (player)
                   : event.key === controls.right
                   ? changePlayerDirection (([x, y]) => [x + k, y]) (player)
                   : event.key === controls.down
                   ? changePlayerDirection (([x, y]) => [x, y + k]) (player)
                   : player
                   )
        };

        const updatePlayer = dt => ghost => player => {
            const movementForce = scale (player.direction) (playerStrength);

            const frictionForce = scale (player.body.vel) (-playerFriction);

            const netForce = add (movementForce) (frictionForce);

            const f = compose (contain)
                              (compose (integrateBody (dt))
                                       (applyForce (netForce)));

            return changePlayerBody (f) (player);
        };

        const renderPlayer = ({body : {pos, size}, image}) =>
            Picture (pos) (size) (image);

        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

        const Automaton = image => body => initial => target =>
            ({ "image": image
             , "body": body
             , "initial": initial
             , "target": target
             });

        const changeAutomatonBody = f => ({image, body, initial, target}) =>
            ({ "image": image
             , "body": f (body)
             , "initial": initial
             , "target": target
             });

        const automatonSize = 48;

        const automatonStrength = 900;

        const automatonFriction = 1;

        const randomAutomatonPoint = () =>
            Vec (Math.random() * (gameWidth - automatonSize))
                (Math.random() * (gameHeight - automatonSize));

        const makeAutomaton = image => pos => target =>
            Automaton (image)
                      (Body (pos)
                            (Vec (automatonSize) (automatonSize))
                            (1)
                            (zeroVec)
                            (zeroVec)
                            (zeroVec))
                      (pos)
                      (target);

        const makeRandomGhost = () =>
            makeAutomaton (assets.ghost)
                          (randomAutomatonPoint ())
                          (randomAutomatonPoint ());

        const makeRandomBomb = () =>
            makeAutomaton (assets.bomb)
                          (randomAutomatonPoint ())
                          (randomAutomatonPoint ());

        const updateAutomaton = dt => automaton => {
            if (gte (sub (automaton.body.pos) (automaton.initial))
                    (sub (automaton.target) (automaton.initial))) {
                const newTarget = randomAutomatonPoint ();
                const newInitial = automaton.body.pos;

                return Automaton (automaton.image)
                                 (automaton.body)
                                 (newInitial)
                                 (newTarget);
            }

            else {
                const difference = sub (automaton.target) (automaton.body.pos);

                const movementForce =
                    scale (normalOrZero (difference)) (automatonStrength);

                const frictionForce = scale (automaton.body.vel) (-automatonFriction);

                const netForce = add (movementForce) (frictionForce);

                const f = compose (contain)
                                  (compose (integrateBody (dt))
                                           (applyForce (netForce)));

                return changeAutomatonBody (f) (automaton);
            }
        };

        const renderAutomaton = automaton =>
            Picture (automaton.body.pos) (automaton.body.size) (automaton.image);

        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

        const stateTypes =
            { "play": 0
            , "win": 1
            };

        const signals = { "restart": 0 };

        const PlayState = player1 => player2 => ghost => bomb =>
            ({ "type": stateTypes.play
             , "player1": player1
             , "player2": player2
             , "ghost": ghost
             , "bomb": bomb
             });

        const makePlayState = player1 => player2 =>
            PlayState (player1)
                      (player2)
                      (makeRandomGhost ())
                      (makeRandomBomb ());

        const makeInitialState = () => makePlayState (player1) (player2);

        const initialState = makeInitialState ();

        const WinState = winner =>
            ({ "type": stateTypes.win
             , "winner": winner
             });

        const maxScore = 10;

        const updateState = dt => state => {
            if (state.type === stateTypes.play) {
                if (state.player1.score >= maxScore) {
                    return WinState (state.player1);
                }

                else if (state.player2.score >= maxScore) {
                    return WinState (state.player2);
                }

                else {
                    const newPlayer1 =
                        updatePlayer (dt) (state.ghost) (state.player1);
                    const newPlayer2 =
                        updatePlayer (dt) (state.ghost) (state.player2);
                    const newGhost =
                        updateAutomaton (dt) (state.ghost);
                    const newBomb =
                        updateAutomaton (dt) (state.bomb);

                    if (areColliding (newPlayer1.body) (newGhost.body)) {
                        return PlayState (changePlayerScore (x => x + 1) (newPlayer1))
                                         (newPlayer2)
                                         (makeRandomGhost ())
                                         (newBomb);
                    }

                    else if (areColliding (newPlayer2.body) (newGhost.body)) {
                        return PlayState (newPlayer1)
                                         (changePlayerScore (x => x + 1) (newPlayer2))
                                         (makeRandomGhost ())
                                         (newBomb);
                    }

                    else if (areColliding (newPlayer1.body) (newBomb.body)) {
                        return PlayState (changePlayerScore (x => x - 1) (newPlayer1))
                                         (newPlayer2)
                                         (newGhost)
                                         (makeRandomBomb ());
                    }

                    else if (areColliding (newPlayer2.body) (newBomb.body)) {
                        return PlayState (newPlayer1)
                                         (changePlayerScore (x => x - 1) (newPlayer2))
                                         (newGhost)
                                         (makeRandomBomb ());
                    }

                    else {
                        return PlayState (newPlayer1)
                                         (newPlayer2)
                                         (newGhost)
                                         (newBomb);
                    }
                }
            }

            else if (state.type === stateTypes.win) {
                return state;
            }
        };

        const renderUI = score1 => score2 =>
            Html (
                H.Div ({"class": "ui"}) ({}) ([
                    H.Div ({"class": "red score"})
                          ({})
                          ([H.Txt (score1.toString())]),
                    H.Div ({"class": "blue score"})
                          ({})
                          ([H.Txt (score2.toString())])
                ])
            );

        const renderWin = winnerName =>
            Html (
                H.Div ({"class": "game-over"}) ({}) ([
                    H.Div ({"class": "container"}) ({}) ([
                        H.H1$ ([H.Txt (winnerName + " Won!")]),
                        H.P$ ([H.Txt ("Noice Job!")]),
                        H.P$ ([
                            H.Button ({"class": "restart"})
                                     ({"click": signals.restart})
                                     ([H.Txt ("Restart")])
                        ])
                    ])
                ])
            );

        const renderState = state => {
            if (state.type === stateTypes.play) {
                return Drawings ([ renderPlayer (state.player1)
                                 , renderPlayer (state.player2)
                                 , renderAutomaton (state.ghost)
                                 , renderAutomaton (state.bomb)
                                 , renderUI (state.player1.score)
                                            (state.player2.score)
                                 ]);
            }

            else if (state.type === stateTypes.win) {
                return renderWin (state.winner.name);
            }
        };

        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

        const controls1 =
            { "left": 65
            , "up": 87
            , "right": 68
            , "down": 83
            , "auto": 16
            };

        const controls2 =
            { "left": 37
            , "up": 38
            , "right": 39
            , "down": 40
            , "auto": 13
            };

        const react = event => state => {
            if (event.type === eventTypes.click &&
                event.id === signals.restart) {
                return makeInitialState ();
            }

            else if (state.type === stateTypes.play &&
                     event.type === eventTypes.key) {
                const newPlayer1 = reactPlayer (event)
                                               (controls1)
                                               (state.player1);
                const newPlayer2 = reactPlayer (event)
                                               (controls2)
                                               (state.player2);

                return PlayState (newPlayer1)
                                 (newPlayer2)
                                 (state.ghost)
                                 (state.bomb);
            }

            else {
                return state;
            }
        };

        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

        const game = Game (initialState) (renderState) (react) (updateState);

        runGame (200) (10) (ui) (ctx) (game);

        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
    });
}

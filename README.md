# JaSMIn

**Ja**vascript **S**occer **M**onitor **In**terface, a webgl based player for RoboCup Soccer Simulation replay files and [SServer](https://github.com/rcsoccersim/rcssserver) logs.



## OVERVIEW

JaSMIn is a webgl based player for displaying soccer games from RoboCup Soccer Simulation leagues (2D and 3D) in a browser. The current version of JaSMIn can replay the following log file formats:
- __.replay__ files, converted SServer log files via the [GIBBS converter](https://github.com/OliverObst/GIBBS)
- __.replay__ files, converted SServer or SimSpark log files with my personal, still unpublished converter...
- __.rcg__ text files (__ULGv4/5__), as currently logged by the SServer simulator

Due to the lack of TCP Socket support within browsers, JaSMIn can not connect directly to simulation servers until they provide a WebSocket interface. At some point in time you may be able to use JaSMIn to watch your simulated soccer matches live... but not today.



## BUILD &amp; SETUP

To build JaSMIn on your local machine simply perform the folowing steps:
1. Clone repository
2. Install build dependencies via node.js:  
   `npm install`
3. Build JaSMIn (may take some time...):  
   `npm run build`

After the build process finished successfully, you'll find two major landing pages in the dist directory:
- _player.html_
- _embedded.html_ (forwarding to _embedded-player.html_)

While the _player.html_ runs a standalone version of JaSMIn, the _embedded.html_ runs an embedded version with a reduced feature set.

For local testing purposes, you can run a webserver from within the repository root directory:

`npm run http`

or - in case you need php support - simply run:

`npm run php`

and then navigate your browser to: `localhost:8080/dist/player.html`.



## DEPLOYMENT

In order to deploy JaSMIn on your own server, you need to follow two steps:
1. Copy all files and directories within the dist directory to your target location.
2. Adapt script paths and functionality in _player.html_, _embedded-player.html_ and _archive.php_.



## DEPENDENCIES

- `threejs`: JaSMIn is using [threejs](https://www.threejs.org) for webgl rendering.
- `pako`: JaSMIn is using [pako](https://github.com/nodeca/pako) for inflating gzipped log files.



## ACKNOWLEDGEMENTS

- The 3D models and textures are partially taken from [RoboViz](https://github.com/magmaOffenburg/RoboViz), respectively [SimSpark](https://gitlab.com/robocup-sim/SimSpark).

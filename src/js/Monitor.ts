import { MonitorModel } from './model/MonitorModel';
import { MonitorParameters } from './MonitorParameters';
import { MonitorUI } from './ui/MonitorUI';


/**
 * External Web-Monitor API.
 */
class Monitor
{
  /** The central monitor model. */
  protected model: MonitorModel;

  /** The central monitor UI controller. */
  protected ui: MonitorUI;

  /**
   * Embedded vs. Standalone:
   * The player can run in embedded or standalone mode. While the standalone
   * version features full functionality integrated in the player itself, the
   * embedded version only provides the core monitor/player component and
   * expects to be commanded from outside the player component.
   * By default, the player runs in standalone mode. To enable the embedded mode,
   * provide the following parameter to the player:
   * params['embedded'] = true
   *
   * Autoplay:
   * The player can check the address-line parameters for a replay path. If
   * autoplay is enabled, the player will look for a replay file path in the
   * address-line and try to load and play it straight away.
   * params['autoplay'] = true
   *
   *
   * Possible parameters (wrapped in an object):
   * - embedded: boolean
   * - archives: [{url: string, name: string}, ...] 
   *
   * @param containerElement the parent element of the monitor
   * @param params the parameter object
   */
  constructor (containerElement: HTMLElement, params: any)
  {
    // Fetch a valid root container
    let container = document.body;
    if (containerElement) {
      container = containerElement;

      // Clear player container (to remove placeholders)
      container.innerHTML = '';
    }

    const monitorParams = new MonitorParameters(params);
    this.model = new MonitorModel(monitorParams.isEmbedded());
    this.ui = new MonitorUI(this.model, container);


    try {
      this.applyParams(monitorParams);
    } catch (ex) {
      console.log('Error while applying monitor parameters!');
    }
  }

  /**
   * Apply the given monitor parameter.
   *
   * @param params the monitor params
   */
  protected applyParams (params: MonitorParameters) : void
  {
    // Add Archives
    const archives = params.getArchives();
    for (let i = 0; i < archives.length; i++) {
      if (archives[i].url && archives[i].name) {
        this.ui.resourceExplorer.archiveExplorer.addLocation(archives[i].url, archives[i].name);
      }
    }


    // Check for resource path parameters
    let url = params.getGameLogURL();
    if (url) {
      // Found game log url
      this.loadGameLog(url);
      this.ui.hideExplorer();
    } else {
      // Check for playlist path parameter
      url = params.getPlaylistURL();

      if (url) {
        this.loadPlaylist(url);
        this.ui.hideExplorer();
      }
    }
  }

  /**
   * Try to load the given files.
   *
   * @param files a list of local files to load/open
   */
  loadFiles (files: File[]) : void
  {
    this.model.loadFiles(files);
  }

  /**
   * Load and play a game log file.
   *
   * @param url the game log file url
   */
  loadGameLog (url: string) : void
  {
    this.model.loadGameLog(url);
  }

  /**
   * Load a playlist.
   *
   * @param url the playlist url
   */
  loadPlaylist (url: string) : void
  {
    this.model.loadPlaylist(url);
  }

  /**
   * Connect to the given streaming server and play the replay stream.
   *
   * @param url the replay streaming server url
   */
  connectStream (url: string) : void
  {
    this.model.connectStream(url);
  }

  /**
   * Connect to a simulation server.
   *
   * @param url the simulation server web-socket url.
   */
  connectSimulator (url: string) : void
  {
    this.model.connectSimulator(url);
  }

  /**
   * Trigger play/pause command.
   */
  playPause () : void
  {
    this.model.logPlayer.playPause();
  }

  /**
   * Trigger stop command.
   */
  stop () : void
  {}

  /**
   * Trigger step command.
   *
   * @param backwards fowrwards/backwards direction indicator (default: forward)
   */
  step (backwards: boolean) : void
  {
    this.model.logPlayer.step(backwards);
  }

  /**
   * Trigger jump command.
   *
   * @param stateIdx the state index to jump to. Negative values are interpreted as: (statesArray.length + stateIdx)
   */
  jump (stateIdx: number) : void
  {
    this.model.logPlayer.jump(stateIdx);
  }

  /**
   * Trigger jump goal command.
   *
   * @param previous next/previous indicator (default: next)
   */
  jumpGoal (previous: boolean) : void
  {
    this.model.logPlayer.jumpGoal(previous);
  }
}

export { Monitor };

import { Panel } from '../components/Panel';
import { SimulationLogLoader } from '../../model/game/loader/SimulationLogLoader';
import { GErrorEvent, GEventObject, GProgressEvent } from '../../utils/EventDispatcher';
import { UIUtil } from '../../utils/UIUtil';

/**
 * The LoadingBar class definition.
 *
 * @author Stefan Glaser
 */
class LoadingBar extends Panel
{
  /** The simulation log loader instance. */
  readonly simulationLogLoader: SimulationLogLoader;

  /** The progress label. */
  readonly progressBar: HTMLDivElement;

  /** The progress label. */
  readonly label: HTMLSpanElement;

  /**
   * LoadingBar Constructor
   *
   * @param simulationLogLoader the simulation log loader instance
   */
  constructor(simulationLogLoader: SimulationLogLoader) {
    super({cls: 'jsm-loading-bar'});

    this.simulationLogLoader = simulationLogLoader;

    this.progressBar = UIUtil.el('div', { parent: this.domElement });
    this.progressBar.style.width = '0px';

    this.label = UIUtil.el('span', { parent: this.domElement, content: '0 / 0 KB' });


    // By default hide the loading bar
    this.setVisible(false);

    // Add simulation log loader event listeners
    this.simulationLogLoader.addEventListener('start', this.handleLoadStart, this);
    this.simulationLogLoader.addEventListener('progress', this.handleLoadProgress, this);
    this.simulationLogLoader.addEventListener('finished', this.handleLoadEnd, this);
    this.simulationLogLoader.addEventListener('error', this.handleLoadEnd, this);
  }

  /**
   * simulationLogLoader->"start" event listener.
   * This event listener is triggered when loading a new simulation log file has started.
   * 
   * @param evt the event object
   */
  handleLoadStart (evt: GProgressEvent): void
  {
    // Reset labels and progress bar
    this.progressBar.style.width = '0%';
    this.label.innerHTML = '0 / 0 MB';

    // Ensure loading bar is visible
    this.setVisible(true);
  }

  /**
   * simulationLogLoader->"progress" event listener.
   * This event listener is triggered when new data was received.
   *
   * @param evt the event object
   */
  handleLoadProgress (evt: GProgressEvent): void
  {
    this.setProgress(100 * evt.progress / evt.total, evt.progress / 1000000, evt.total / 1000000);
  }

  /**
   * simulationLogLoader->"finished"|"error" event listener.
   * This event listener is triggered when loading a new simulation log file has terminated.
   *
   * @param evt the event object
   */
  handleLoadEnd (evt: GEventObject | GErrorEvent): void
  {
    // Hide loading bar on load end
    this.setVisible(false);
  }

  /**
   * The callback triggered when a new replay file is loaded.
   *
   * @param percent the loaded percentage
   * @param loadedMB the MBs loaded
   * @param totalMB the total MBs to load
   */
  setProgress (percent: number, loadedMB: number, totalMB: number): void
  {
    this.progressBar.style.width = '' + percent.toFixed(1) + '%';
    this.label.innerHTML = '' + loadedMB.toFixed(3) + ' / ' + totalMB.toFixed(3) + ' MB';
  }
}

export { LoadingBar };

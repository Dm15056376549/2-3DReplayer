import { TabPane } from '../components/TabPane';
import { Panel } from '../components/Panel';
import { UIUtil } from '../../utils/UIUtil';
import { ArchiveExplorer } from './ArchiveExplorer';
import { MonitorModel } from '../../model/MonitorModel';

/**
 * The ResourceExplorer class definition.
 *
 * The ResourceExplorer provides browsing capabilities to various sources.
 *
 * @author Stefan Glaser
 */
class ResourceExplorer extends TabPane
{
  /** The monitor model instance. */
  model: MonitorModel;

  /** The archive explorer instance. */
  archiveExplorer: ArchiveExplorer;


  /** The file chooser input line, for selecting local files. */
  fileInput: HTMLInputElement;

  /** The binded listener method for showing the file chooser dialog. */
  showFileChooserListener: (ev: MouseEvent) => any;


  /** The open local resource button. */
  openResourceItem: HTMLLIElement;

  /**
   * ResourceExplorer Constructor
   *
   * @param model the monitor model instance
   */
  constructor (model: MonitorModel)
  {
    super('jsm-explorer');

    this.model = model;
    this.archiveExplorer = new ArchiveExplorer(this.model.logPlayer);
    /*this.archiveExplorer.onGameLogSelected = function () {
      const mm = model;

      return function (url) {
        mm.loadGameLog(url);
      }
    }();*/
    // this.archiveExplorer.addLocation('http://archive.robocup.info/app/JaSMIn/archive.php', 'archive.robocup.info');
    // this.archiveExplorer.addLocation('http://localhost:8080/build/archive.php');TabPane
    // this.archiveExplorer.addLocation('archive.php', 'Archive');


    // Create Archive tab
    const headerPanel = new Panel();
    UIUtil.el('span', { parent: headerPanel.domElement, content: 'Archives', title: 'Browse Replay Archives' });

    this.addPanels(headerPanel, this.archiveExplorer);

    // Create Simulators tab
    // this.addElements(UIUtil.createSpan('Simulators'), UIUtil.createSpan('Simulator Browser'));

    // Create Streams tab
    // this.addElements(UIUtil.createSpan('Streams'), UIUtil.createSpan('Stream Browser'));

    this.showFileChooserListener = this.showFileChooser.bind(this);

    this.openResourceItem = UIUtil.el('li', { parent: this.tabHeaderList, cls: 'open-resource' });
    this.openResourceItem.onclick = this.showFileChooserListener;
    UIUtil.el('span', { parent: this.openResourceItem, content: 'Open', title: 'Open local resource...' });

    this.fileInput = UIUtil.el('input', { parent: this.openResourceItem });
    this.fileInput.type = 'file';
    this.fileInput.accept = '.rpl3d, .rpl2d, .replay, .rcg, .json, .rpl3d.gz, .rpl2d.gz, .replay.gz, .rcg.gz';
    this.fileInput.multiple = true;
    this.fileInput.onchange = function () {
      const mm = model;

      return function (evt: Event) {
        const files = (evt.target as HTMLInputElement).files;

        if (files && files.length > 0) {
          mm.loadFiles(files);
        }
      };
    }();
  }

  /**
   * Show file chooser.
   */
  showFileChooser (): void
  {
    this.fileInput.click();
  }
}

export { ResourceExplorer };

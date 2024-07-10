import { Panel } from '../components/Panel';
import { UIUtil } from '../../utils/UIUtil';
import { Archive } from './Archive';
import { LogPlayer } from '../../model/logplayer/LogPlayer';


/**
 * The ArchiveExplorer class definition.
 *
 * The ArchiveExplorer provides browsing capabilities to multiple remote archives.
 *
 * @author Stefan Glaser
 */
class ArchiveExplorer extends Panel
{
  /** The log player model instance. */
  logPlayer: LogPlayer;

  /** The archive list. */
  archiveList: HTMLUListElement;

  /** The add archive list item. */
  addArchiveItem: HTMLLIElement;

  /** The add archive list item. */
  addArchiveBox: HTMLDivElement;

  /** The new archive location input field. */
  archiveLocationInput: HTMLInputElement;

  /** The new archive name input field. */
  archiveNameInput: HTMLInputElement;

  /**  */
  onAddNewLocationListener: (ev: MouseEvent | KeyboardEvent) => any;

  /** The add new archive button. */
  addArchiveBtn: HTMLButtonElement;

  /**  */
  handleGameLogSelectedListener: Function;
  /**  */
  handlePlaylistSelectedListener: Function;

  /**
   * ArchiveExplorer Constructor
   *
   * @param logPlayer the log player model
   */
  constructor (logPlayer: LogPlayer)
  {
    super({cls: 'jsm-archive-explorer'});

    this.logPlayer = logPlayer;
    
    this.archiveList = UIUtil.el('ul', { parent: this.domElement, cls: 'archive-list' });
    this.addArchiveItem = UIUtil.el('li', { parent: this.archiveList, cls: 'add-archive expandable' });

    let label = UIUtil.el('span', { parent: this.addArchiveItem, content: 'Add new Archive',  cls: 'no-text-select' });
    label.addEventListener('click', ArchiveExplorer.toggleExpand, false);
    
    this.addArchiveBox = UIUtil.el('div', { parent: this.addArchiveItem, cls: 'add-box' });
    UIUtil.setVisibility(this.addArchiveBox, false);

    label = UIUtil.el('label', { parent: this.addArchiveBox });
    UIUtil.el('span', { parent: label, content: 'URL:' });
    this.archiveLocationInput = UIUtil.el('input', { parent: label });
    this.archiveLocationInput.name = 'location';
    this.archiveLocationInput.type = 'url';
    this.archiveLocationInput.value = 'https://';

    label = UIUtil.el('label', { parent: this.addArchiveBox });
    UIUtil.el('span', { parent: label, content: 'Name:' });
    this.archiveNameInput = UIUtil.el('input', { parent: label });
    this.archiveNameInput.name = 'name';
    this.archiveNameInput.type = 'text';

    this.onAddNewLocationListener = this.onAddNewLocation.bind(this);

    this.addArchiveBtn = UIUtil.createButton('Add', 'add-archive', 'Add new archive location to list of archives', this.onAddNewLocationListener);
    this.addArchiveBox.appendChild(this.addArchiveBtn);

    this.handleGameLogSelectedListener = this.handleGameLogSelected.bind(this);
    this.handlePlaylistSelectedListener = this.handlePlaylistSelected.bind(this);
  }

  /**
   * Add location action listener.
   *
   * @param evt the button event
   */
  onAddNewLocation (evt: MouseEvent | KeyboardEvent): void
  {
    const url = this.archiveLocationInput.value;
    let label = this.archiveNameInput.value;

    if (!url || url === 'https://' || url === 'http://') {
      return;
    }

    if (!label) {
      label = url;
    }

    // Add location
    this.addLocation(url, label);

    // Reset input elements
    this.archiveLocationInput.value = 'https://';
    this.archiveNameInput.value = '';

    // Hide input elements
    UIUtil.setVisibility(this.addArchiveBox, false);
    this.addArchiveItem.className = this.addArchiveItem.className.replace(' expanded', '');
  }

  /**
   * Add new location to list of archives.
   *
   * @param url the url to the new archive location
   * @param label the label text to display
   */
  addLocation (url: string, label: string): void
  {
    const newArchive = new Archive(url, label);
    newArchive.gameLogSelectionCallback = this.handleGameLogSelectedListener;
    newArchive.playlistSelectionCallback = this.handlePlaylistSelectedListener;
    this.archiveList.appendChild(newArchive.domElement);
  }

  /**
   * Handle selection of a game log within one of the archives.
   *
   * @param logURL the selected game log url
   */
  handleGameLogSelected (logURL: string): void
  {
    this.logPlayer.loadGameLog(logURL);
  }

  /**
   * Handle selection of a playlist within one of the archives.
   *
   * @param listURL the selected playlist url
   */
  handlePlaylistSelected (listURL: string): void
  {
    this.logPlayer.loadPlaylist(listURL);
  }

  /**
   * Toggle expanded state of the clicked item.
   *
   * @param evt the click event
   */
  static toggleExpand (evt: MouseEvent): void
  {
    if (evt.target && evt.target instanceof HTMLElement) { 
      const item = evt.target.parentElement;

      if (item) {
        if (UIUtil.toggleVisibility(item.getElementsByTagName('div')[0])) {
          item.className = item.className.replace('expandable', 'expanded');
        } else {
          item.className = item.className.replace('expanded', 'expandable');
        }
      }
    }
  }
}

export { ArchiveExplorer };

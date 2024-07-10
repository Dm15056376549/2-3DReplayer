import { UIUtil } from '../../utils/UIUtil';

/**
 * The Archive class definition.
 *
 * The Archive provides browsing capabilities to one remote archive.
 *
 * @author Stefan Glaser
 */
class Archive
{
  /** The archive url. */
  archiveURL: string;


  /** The game log selection callback. */
  gameLogSelectionCallback: Function | undefined;

  /** The playlist selection callback. */
  playlistSelectionCallback: Function | undefined;


  /**  */
  loadFolderListener: (ev: MouseEvent | KeyboardEvent) => any;
  /**  */
  loadGameLogListener: (ev: MouseEvent | KeyboardEvent) => any;
  /**  */
  loadPlaylistListener: (ev: MouseEvent | KeyboardEvent) => any;


  /** The component root element. */
  domElement: HTMLLIElement;

  /**
   * Archive Constructor
   *
   * @param url the archive url
   * @param label the archive label
   */
  constructor (url: string, label: string)
  {
    this.archiveURL = url;
    
    this.gameLogSelectionCallback = undefined;
    this.playlistSelectionCallback = undefined;

    this.loadFolderListener = this.loadFolder.bind(this);
    this.loadGameLogListener = this.loadGameLog.bind(this);
    this.loadPlaylistListener = this.loadPlaylist.bind(this);

    this.domElement = this.createFolderItem(label, '/', 'archive-root');
  }

  /**
   * Create a folder item.
   *
   * @param label the folder label
   * @param path the folder path
   * @param className the item css class string
   * @returns the new folder item
   */
  createFolderItem (label: string, path: string, className: string | undefined = undefined): HTMLLIElement
  {
    let liClassName = 'folder new';
    if (className !== undefined) {
      liClassName += ' ' + className;
    }

    const newItem = UIUtil.el('li', { cls: liClassName });
    newItem.dataset.path = path;

    // Add folder label
    const titleLbl = UIUtil.el('span', { parent: newItem, content: label, cls: 'title no-text-select' });
    titleLbl.tabIndex = 0;
    titleLbl.addEventListener('click', this.loadFolderListener);
    titleLbl.addEventListener('keydown', this.loadFolderListener);

    // Check for top-level folder
    if (path === '/') {
      // Set tool tip
      titleLbl.title = this.archiveURL;

      // Create remove archive button
      const btn = UIUtil.createButton('Del', 'remove-btn', 'Remove "' + this.archiveURL + '" from list of archives.');
      btn.addEventListener('click', Archive.removeArchive);
      btn.addEventListener('keydown', Archive.removeArchive);
      titleLbl.appendChild(btn);
    }

    return newItem;
  }

  /**
   * Create a game log item.
   *
   * @param label the game log label
   * @param path the game log path
   * @param className the additional game log item class
   * @returns the new game log item
   */
  createGameLogItem (label: string, path: string, className: string): HTMLLIElement
  {
    const newItem = UIUtil.el('li', { cls: 'game-log' + ' ' + className });
    newItem.dataset.path = path;

    // Add game log label
    const titleLbl = UIUtil.el('span', { parent: newItem, content: label, cls: 'title no-text-select' });
    titleLbl.tabIndex = 0;
    titleLbl.title = label;
    titleLbl.addEventListener('click', this.loadGameLogListener);
    titleLbl.addEventListener('keydown', this.loadGameLogListener);

    return newItem;
  }

  /**
   * Create a playlist item.
   *
   * @param label the playlist label
   * @param path the playlist path
   * @returns the new playlist item
   */
  createPlaylistItem (label: string, path: string): HTMLLIElement
  {
    const newItem = UIUtil.el('li', { cls: 'playlist' });
    newItem.dataset.path = path;

    // Add game log label
    const titleLbl = UIUtil.el('span', { parent: newItem, content: label, cls: 'title no-text-select' });
    titleLbl.tabIndex = 0;
    titleLbl.title = label;
    titleLbl.addEventListener('click', this.loadPlaylistListener);
    titleLbl.addEventListener('keydown', this.loadPlaylistListener);

    return newItem;
  }

  /**
   * Action handler for loading a folder.
   *
   * @param evt the click event
   */
  loadFolder (evt: MouseEvent | KeyboardEvent): void
  {
    const item = Archive.getItemForEvent(evt);
    if (!item || !item.dataset.path) {
      return;
    }

    const path = item.dataset.path;
    const scope = this;

    const handleLoad = function() {
      const archive = scope;
      const folderItem = item;

      // ANYFIX: Should be "ProgressEvent<XMLHttpRequestEventTarget>", but then a lot of stuff is not specified...
      return function (evt: any) {
        let newClass = '';

        if (evt.target.status === 200 || evt.target.status === 0) {
          // Successfully loaded
          let listing: any = {};

          try {
            listing = JSON.parse(evt.target.response);
          } catch(e) {
            // Parsing error
            console.log(e);
          }

          if (listing['type'] === 'archive') {
            const sublist = UIUtil.el('ul', { cls: 'folder-listing' });
            const folders = listing['folders'];
            const replays = listing['replays'];
            const sserverLogs = listing['sserverlogs'];
            const playlists = listing['playlists'];

            if (folders !== undefined) {
              for (let i = 0; i < folders.length; ++i) {
                sublist.appendChild(archive.createFolderItem(folders[i]['label'], folders[i]['path']));
              }
            }

            if (replays !== undefined) {
              for (let i = 0; i < replays.length; ++i) {
                sublist.appendChild(archive.createGameLogItem(replays[i]['label'], replays[i]['path'], 'replay'));
              }
            }

            if (sserverLogs !== undefined) {
              for (let i = 0; i < sserverLogs.length; ++i) {
                sublist.appendChild(archive.createGameLogItem(sserverLogs[i]['label'], sserverLogs[i]['path'], 'sserver-log'));
              }
            }

            if (playlists !== undefined) {
              for (let i = 0; i < playlists.length; ++i) {
                sublist.appendChild(archive.createPlaylistItem(playlists[i]['label'], playlists[i]['path']));
              }
            }

            if (sublist.children.length > 0) {
              folderItem.appendChild(sublist)
              newClass = 'expanded';

              const titleLbl = folderItem.getElementsByTagName('SPAN')[0] as HTMLSpanElement;
              titleLbl.addEventListener('click', Archive.toggleExpand);
              titleLbl.addEventListener('keydown', Archive.toggleExpand);
            } else {
              newClass = 'empty';

              (folderItem.getElementsByTagName('SPAN')[0] as HTMLSpanElement).tabIndex = -1;
            }
          } else {
            // Invalid response
          }
        } else if (evt.target.status === 404) {
          // Archive not found
          newClass = 'not-found';

          (folderItem.getElementsByTagName('SPAN')[0] as HTMLSpanElement).tabIndex = -1;
        } else {
          // Error during loading
          console.log('Error ajax resonse for "' + folderItem.dataset.path + '"!');
          newClass = 'error';

          // Add load listener again
          const titleLbl = folderItem.getElementsByTagName('SPAN')[0] as HTMLSpanElement;
          titleLbl.addEventListener('click', archive.loadFolderListener);
          titleLbl.addEventListener('keydown', archive.loadFolderListener);
        }

        folderItem.className = folderItem.className.replace('loading', newClass);
      };
    }();

    const handleError = function() {
      const archive = scope;
      const folderItem = item;

      return function (evt: ProgressEvent<XMLHttpRequestEventTarget>) {
        console.log('Error ajax resonse for "' + folderItem.dataset.path + '"!');
        folderItem.className = folderItem.className.replace('loading', 'error');

        // Add load listener again
        const titleLbl = folderItem.getElementsByTagName('SPAN')[0] as HTMLSpanElement;
        titleLbl.addEventListener('click', archive.loadFolderListener);
        titleLbl.addEventListener('keydown', archive.loadFolderListener);
      };
    }();

    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.archiveURL + '?path=' + encodeURIComponent(path), true);

    // Add event listeners
    xhr.addEventListener('load', handleLoad, false);
    xhr.addEventListener('error', handleError, false);

    // Set mime type
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain');
    }

    // Send request
    xhr.send(null);

    // Indicate loading of item
    item.className = item.className.replace('new', 'loading').replace('error', 'loading');

    // Remove load listener
    (evt.target as HTMLElement).removeEventListener('click', this.loadFolderListener);
    (evt.target as HTMLElement).removeEventListener('keydown', this.loadFolderListener);
  }

  /**
   * Action handler for loading a game log file.
   *
   * @param evt the click event
   */
  loadGameLog (evt: MouseEvent | KeyboardEvent): void
  {
    const item = Archive.getItemForEvent(evt);
    if (!item) {
      return;
    }

    if (this.gameLogSelectionCallback) {
      const path = item.dataset.path;
      const idx = this.archiveURL.lastIndexOf('/');

      this.gameLogSelectionCallback(this.archiveURL.slice(0, idx + 1) + path);
    }
  }

  /**
   * Action handler for loading a playlist file.
   *
   * @param evt the click event
   */
  loadPlaylist (evt: MouseEvent | KeyboardEvent): void
  {
    const item = Archive.getItemForEvent(evt);
    if (!item) {
      return;
    }

    if (this.playlistSelectionCallback) {
      const path = item.dataset.path;
      const idx = this.archiveURL.lastIndexOf('/');

      this.playlistSelectionCallback(this.archiveURL.slice(0, idx + 1) + path);
    }
  }

  /**
   * Action handler for loading a folder.
   *
   * @param evt the click event
   * @returns
   */
  static getItemForEvent (evt: MouseEvent | KeyboardEvent): HTMLElement | null
  {
    if (UIUtil.isButtonAction(evt) && evt.target instanceof HTMLElement) {
      return evt.target.parentElement;
    }

    return null;
  }

  /**
   * Toggle expanded state of the clicked item.
   *
   * @param evt the click or key event
   */
  static toggleExpand (evt: MouseEvent | KeyboardEvent): void
  {
    const item = Archive.getItemForEvent(evt);
    if (!item) {
      return;
    }

    if (UIUtil.toggleVisibility(item.getElementsByTagName('ul')[0])) {
      item.className = item.className.replace('expandable', 'expanded');
    } else {
      item.className = item.className.replace('expanded', 'expandable');
    }
  }

  /**
   * Toggle expanded state of the clicked item.
   *
   * @param evt the click or key event
   */
  static removeArchive (evt: MouseEvent | KeyboardEvent): void
  {
    const label = Archive.getItemForEvent(evt);
    if (!label) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    // Remove dom node
    const item = label.parentNode;
    if (item && item.parentNode) {
      item.parentNode.removeChild(item);
    }
  }
}

export { Archive };

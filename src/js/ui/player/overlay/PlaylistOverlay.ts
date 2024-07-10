import { Overlay } from '../../components/Overlay';
import { ToggleItem } from '../../components/ToggleItem';
import { UIUtil } from '../../../utils/UIUtil';
import { LogPlayer } from '../../../model/logplayer/LogPlayer';
import { Playlist, GameLogEntry, GameLogEntryUpdatedEvent } from '../../../model/logplayer/Playlist';
import { GChangeEvent, GEventObject } from '../../../utils/EventDispatcher';

/**
 * The PlaylistOverlay class definition.
 *
 * @author Stefan Glaser
 */
class PlaylistOverlay extends Overlay
{
  /** The log player model instance. */
  logPlayer: LogPlayer;

  /** The playlist instance. */
  playlist?: Playlist;

  /** The playlist title label. */
  titleLbl: HTMLSpanElement;

  /** The autoplay toggle item. */
  autoplayItem: ToggleItem;

  /** The playlist entry list. */
  entryList: HTMLUListElement;

  // -------------------- Listeners -------------------- //
  /**  */
  playEntryListener: (ev: MouseEvent | KeyboardEvent) => any;

  /**
   * PlaylistOverlay Constructor
   *
   * @param logPlayer the log player model instance
   */
  constructor (logPlayer: LogPlayer)
  {
    super({cls: 'jsm-playlist'});

    this.logPlayer = logPlayer;
    this.playlist = logPlayer.playlist;

    const titleBar = UIUtil.el('div', { parent: this.innerElement, cls: 'title-bar' });
    this.titleLbl = UIUtil.el('span', { parent: titleBar, content: 'My Playlist', cls: 'title' });

    const settingsBar = UIUtil.el('ul', { parent: this.innerElement, cls: 'settings-bar' });

    this.autoplayItem = new ToggleItem('Autoplay', 'On', 'Off', false, 'item');
    this.autoplayItem.onChanged = this.handleAutoplayFormChange.bind(this);
    settingsBar.appendChild(this.autoplayItem.domElement);

    const contentBox = UIUtil.el('div', { parent: this.innerElement, cls: 'content-box' });
    this.entryList = UIUtil.el('ul', { parent: contentBox, cls: 'playlist' });


    // -------------------- Listeners -------------------- //
    this.playEntryListener = this.playEntry.bind(this);


    // Add log player change listeners
    this.logPlayer.addEventListener('playlist-change', this.handlePlaylistChange, this);
    this.logPlayer.addEventListener('game-log-change', this.refreshSelections, this);

    if (this.playlist) {
      this.refreshListing();
      this.refreshAutoplay();

      this.playlist.addEventListener('update', this.handlePlaylistUpdate, this);
      this.playlist.addEventListener('change', this.refreshListing, this);
      this.playlist.addEventListener('active-change', this.refreshSelections, this);
      this.playlist.addEventListener('autoplay-change', this.refreshAutoplay, this);
    }
  }

  /**
   * Refresh the playlist items.
   */
  refreshListing (): void
  {
    let entryIndex = 0;
    let entry: GameLogEntry;
    let newEntries: GameLogEntry[] = [];
    const playingIdx = this.logPlayer.playlistIndex;
    let selectedIdx = -1;

    if (this.playlist) {
      selectedIdx = this.playlist.activeIndex;
      newEntries = this.playlist.entries;

      this.titleLbl.innerHTML = this.playlist.title;
    } else {
      this.titleLbl.innerHTML = 'n/a';
    }

    // Update all entry item nodes in entry list
    for (let i = 0; i < this.entryList.children.length; i++) {
      const child = this.entryList.children[i];

      if (child instanceof HTMLLIElement) {
        entry = newEntries[entryIndex];

        // Refresh item entry
        this.refreshEntry(child, entry, entryIndex);
        this.refreshEntryClass(child, playingIdx, selectedIdx);

        entryIndex++;
      }
    }

    // Check if we need to add further item nodes
    while (entryIndex < newEntries.length) {
      entry = newEntries[entryIndex];
      const child = UIUtil.el('li', { parent: this.entryList, cls: 'entry' });
      child.tabIndex = 0;

      this.refreshEntry(child, entry, entryIndex);
      this.refreshEntryClass(child, playingIdx, selectedIdx);

      child.addEventListener('click', this.playEntryListener);
      child.addEventListener('keydown', this.playEntryListener);

      entryIndex++;
    }

    // TODO: Think about removing dead entries again, as switching from a very long to a rather short playlist may cause a lot of them...
  }

  /**
   * Refresh the css class of the given item entry.
   *
   * @param item the list item element
   * @param playingIdx the index of the currently played game log
   * @param selectedIdx the index of the currently selected game log
   */
  refreshEntryClass (item: HTMLLIElement, playingIdx: number, selectedIdx: number): void
  {
    const entryIdx = parseInt(item.dataset.entryIdx || '0', 10);

    item.className = 'entry';
    if (entryIdx === playingIdx) {
      item.className += ' playing';
    } else if (entryIdx === selectedIdx) {
      item.className += ' selected';
    }

    if (item.dataset.valid !== 'true') {
      item.className += ' error';
    }
  }

  /**
   * Refresh the given item entry.
   *
   * @param item the list item element
   * @param entry the game log entry instance
   * @param index the entry index
   */
  refreshEntry (item: HTMLLIElement, entry?: GameLogEntry, index?: number): void
  {
    if (index === undefined || entry === undefined) {
      // Clear item...
      item.dataset.entryIdx = '-1';
      item.dataset.valid = 'false';
      item.title = '';
      item.innerHTML = '';

      // ... and hide it
      UIUtil.setVisibility(item, false);
    } else {
      // Update item data...
      item.dataset.entryIdx = index.toString();
      item.dataset.valid = entry.errorMsg ? 'false' : 'true';
      item.title = entry.errorMsg || '';

      // if (entry.info) {
      //   item.innerHTML = entry.info.leftTeamName + ' vs ' + entry.info.rightTeamName;
      // } else {
        item.innerHTML = entry.title;
      // }


      // ... and ensure it's visible
      UIUtil.setVisibility(item, true);
    }
  }

  /**
   * Refresh the autoplay toggle button.
   */
  refreshAutoplay (): void
  {
    if (this.playlist) {
      this.autoplayItem.setState(this.playlist.autoplay);
    }
  }

  /**
   * Refresh the selection status of the playlist items.
   */
  refreshSelections (): void
  {
    if (this.playlist) {
      const playingIdx = this.logPlayer.playlistIndex;
      const selectedIdx = this.playlist.activeIndex;
      let child;

      // Update all entry item nodes in entry list
      for (let i = 0; i < this.entryList.children.length; i++) {
        child = this.entryList.children[i];

        if (child instanceof HTMLLIElement) {
          this.refreshEntryClass(child, playingIdx, selectedIdx);
        }
      }
    }
  }

  /**
   * Action handler for playing en entry of the playlist.
   *
   * @param evt the click event
   */
  playEntry (evt: MouseEvent | KeyboardEvent): void
  {
    if (!UIUtil.isButtonAction(evt)) {
      return;
    }

    if (!!this.playlist && evt.target instanceof HTMLLIElement) {
      const idx = evt.target.dataset.entryIdx;

      if (idx !== undefined && evt.target.dataset.valid === 'true') {
        this.playlist.setActiveIndex(parseInt(idx, 10));
      }
    }
  }

  /**
   * Change listener callback function for the autoplay single choice form element.
   */
  handleAutoplayFormChange (): void
  {
    if (this.playlist) {
      this.playlist.setAutoplay(this.autoplayItem.isOn());
    }
  }

  /**
   * Toggle autoplay of the playlist.
   */
  toggleAutoplay (): void
  {
    if (this.playlist) {
      this.playlist.setAutoplay(!this.playlist.autoplay);
    }
  }

  /**
   * Handle playlist updated event.
   *
   * @param evt the event object
   */
  handlePlaylistUpdate (evt: GameLogEntryUpdatedEvent): void
  {
    const entryIdx = evt.index;
    const entry = evt.entry;

    // Update all entry item nodes in entry list
    for (let i = 0; i < this.entryList.children.length; i++) {
      const child = this.entryList.children[i];

      if (child instanceof HTMLLIElement) {
        if (entryIdx === parseInt(child.dataset.entryIdx || '0', 10)) {
          if (entry.errorMsg) {
            child.dataset.valid = 'false';
            child.title = entry.errorMsg;
          } else {
            child.dataset.valid = 'true';
            child.title = '';
          }

          this.refreshEntryClass(child, this.logPlayer.playlistIndex, entryIdx);
          break;
        }
      }
    }
  }

  /**
   * Handle playlist change.
   *
   * @param evt the change event
   */
  handlePlaylistChange (evt: GChangeEvent<Playlist | undefined>): void
  {
    if (this.playlist) {
      this.playlist.removeEventListener('update', this.handlePlaylistUpdate, this);
      this.playlist.removeEventListener('change', this.refreshListing, this);
      this.playlist.removeEventListener('active-change', this.refreshSelections, this);
      this.playlist.removeEventListener('autoplay-change', this.refreshAutoplay, this);
    }

    this.playlist = this.logPlayer.playlist;
    this.refreshListing();
    this.refreshAutoplay();

    if (this.playlist) {
      this.playlist.addEventListener('update', this.handlePlaylistUpdate, this);
      this.playlist.addEventListener('change', this.refreshListing, this);
      this.playlist.addEventListener('active-change', this.refreshSelections, this);
      this.playlist.addEventListener('autoplay-change', this.refreshAutoplay, this);
    } else {
      // Hide playlist overlay if no playlist available
      this.setVisible(false);
    }
  }
}

export { PlaylistOverlay };

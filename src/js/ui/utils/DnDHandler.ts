/**
 * The DnDHandler class definition.
 *
 * @author Stefan Glaser
 */
class DnDHandler
{
  /** The callback for publishing dropped files. */
  onNewFilesDropped: ((files: FileList) => any) | undefined;


  // -------------------- Listeners -------------------- //
  /** Drag enter listener */
  handleDragEnterListener: (ev: DragEvent) => any;
  /** Drag end listener */
  handleDragEndListener: (ev: DragEvent) => any;
  /** Drag over listener */
  handleDragOverListener: (ev: DragEvent) => any;
  /** Drop listener */
  handleDropListener: (ev: DragEvent) => any;

  /**
   * DnDHandler Constructor
   */
  constructor ()
  {
    this.onNewFilesDropped = undefined;

    // -------------------- Listeners -------------------- //
    this.handleDragEnterListener = this.handleDragEnter.bind(this);
    this.handleDragEndListener = this.handleDragEnd.bind(this);
    this.handleDragOverListener = this.handleDragOver.bind(this);
    this.handleDropListener = this.handleDrop.bind(this);
  }

  /**
   * Add Drag and Drop event listeners to the given element.
   *
   * @param element the element to observe for dnd-events
   */
  addListeners (element: HTMLElement): void
  {
    element.addEventListener('dragenter', this.handleDragEnterListener);
    element.addEventListener('dragover', this.handleDragOverListener);
    element.addEventListener('dragleave', this.handleDragEndListener);
    element.addEventListener('dragend', this.handleDragEndListener);
    element.addEventListener('drop', this.handleDropListener);
  }

  /**
   * Remove Drag and Drop event listeners from the given element.
   *
   * @param element the element to unobserve
   */
  removeListeners (element: HTMLElement): void
  {
    element.removeEventListener('dragenter', this.handleDragEnterListener);
    element.removeEventListener('dragover', this.handleDragOverListener);
    element.removeEventListener('dragleave', this.handleDragEndListener);
    element.removeEventListener('dragend', this.handleDragEndListener);
    element.removeEventListener('drop', this.handleDropListener);
  }

  /**
   * Reset a target element.
   *
   * @param target the target element to reset
   */
  resetTarget (target: EventTarget | null): void
  {
    if (target instanceof HTMLElement) {
      target.className = target.className.replace('dragging-over', '');
    }
  }

  /**
   * Handle a file drop event.
   *
   * @param evt the drop event
   */
  handleDrop (evt: DragEvent): void
  {
    evt.stopPropagation();
    evt.preventDefault();

    // rest target
    this.resetTarget(evt.target);

    if (this.onNewFilesDropped && !!evt.dataTransfer && evt.dataTransfer.files.length > 0) {
      this.onNewFilesDropped(evt.dataTransfer.files);
    }
  }

  /**
   * Handle dragging enter.
   *
   * @param evt the drag over event
   */
  handleDragEnter (evt: DragEvent): void
  {
    // console.log('Drag Enter');
    // console.log(evt.dataTransfer);
    if (evt.dataTransfer) { 
      const dtItem = evt.dataTransfer.items[0];

      if (dtItem && dtItem.kind === 'file') {
        if (evt.target instanceof HTMLElement) {
          evt.target.className += ' dragging-over';
        }
      }
    }
  }

  /**
   * Handle dragging end/exit.
   *
   * @param evt the drag event
   */
  handleDragEnd (evt: DragEvent): void
  {
    // console.log('Drag End');
    // console.log(evt.dataTransfer);

    // rest target
    this.resetTarget(evt.target);
  }

  /**
   * Handle dragging over.
   *
   * @param evt the drag over event
   */
  handleDragOver (evt: DragEvent): void
  {
    // console.log('Drag over');
    // console.log(evt.dataTransfer);
    if (evt.dataTransfer) { 
      const dtItem = evt.dataTransfer.items[0];
      
      if (dtItem && dtItem.kind === 'file') {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
      }
    }
  }
}

export { DnDHandler };

import { UIUtil } from '../../utils/UIUtil';
import { Panel } from './Panel';
import { PanelGroup } from './PanelGroup';

/**
 *
 * @author Stefan Glaser
 */
class Tab
{
  /** The tab header panel. */
  head: Panel;

  /** The tab content panel. */
  content: Panel;

  /**
   * Tab Constructor
   *
   * @param head the tab header panel
   * @param content the tab content panel
   */
  constructor (head: Panel, content: Panel)
  {
    this.head = head;
    this.content = content;
  }
}

export { Tab };



/**
 * The TabPane class definition.
 *
 * The TabPane abstracts
 *
 * @author Stefan Glaser
 */
class TabPane extends Panel
{
  /** The tab header container. */
  tabHeaderList: HTMLUListElement;

  /** The tab header container. */
  tabContent: HTMLDivElement;

  /** The tabs of this tab pane. */
  tabs: Tab[];

  /** The tab group, managing visibility of content panels. */
  tabGroup: PanelGroup;

  /**
   * TabPane Constructor
   *
   * @param className the css class string
   */
  constructor (className: string | undefined = undefined)
  {
    super({cls: 'jsm-tab-pane' + (className === undefined ? '' : ' ' + className)});

    // Create header row
    let row = UIUtil.el('div', { parent: this.domElement, cls: 't-row' });
    const cell = UIUtil.el('div', { parent: row, cls: 'tab-header' });
    this.tabHeaderList = UIUtil.el('ul', { parent: cell });

    // Create content row
    row = UIUtil.el('div', { parent: this.domElement, cls: 't-row' });

    this.tabContent = UIUtil.el('div', { parent: row, cls: 'tab-content' });

    this.tabs = [];
    this.tabGroup = new PanelGroup();
  }

  /**
   * Add the given tab to the tab-pane.
   *
   * @param tab the new tab to add
   */
  add (tab: Tab): void
  {
    // Store new tab
    this.tabs.push(tab);

    // Add content to tab panel group
    this.tabGroup.add(tab.content);

    // Add new tab to containers
    const li = UIUtil.el('li', { parent: this.tabHeaderList });
    li.onclick = function (evt) {
      tab.content.setVisible();

      // Deactivate all header items
      if (li.parentNode) {
        const tabHeaders = li.parentNode.childNodes;
        for (let i = 0; i < tabHeaders.length; ++i) {
          const tabHeader = tabHeaders[i];
          if (tabHeader instanceof HTMLLIElement) {
            tabHeader.className = tabHeader.className.replace('active', '');
          }
        }
      }

      // Reactivate selected item
      li.className += ' active';
    }

    li.appendChild(tab.head.domElement);
    this.tabContent.appendChild(tab.content.domElement);

    // Activate first tab
    if (this.tabs.length === 1) {
      // By default show first tab
      tab.content.setVisible();
      li.className = 'active';
    }
  }

  /**
   * Add the given panels as tab to the tab-pane.
   *
   * @param head the tab header panel
   * @param content the tab content panel
   * @returns the newly created and added tab
   */
  addPanels (head: Panel, content: Panel): Tab
  {
    const newTab = new Tab(head, content);

    this.add(newTab);

    return newTab;
  }

  /**
   * Wrap the given elements in panels and add them as tab to the tab-pane.
   *
   * @param head the tab header element
   * @param content the tab content element
   * @returns the newly created and added tab
   */
  addElements (head: HTMLElement, content: HTMLElement): Tab
  {
    const headPanel = new Panel();
    headPanel.appendChild(head);

    const contentPanel = new Panel();
    contentPanel.appendChild(content);

    return this.addPanels(headPanel, contentPanel);
  }
}

export { TabPane };

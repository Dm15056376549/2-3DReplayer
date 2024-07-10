import { EventDispatcher, GEventObject } from '../../utils/EventDispatcher';
import { MonitorConfiguration } from './MonitorConfiguration';
import { ConfigurationModel } from './ConfigurationModel';

/** The monitor settings event map interface. */
export interface MonitorSettingsEventMap {
  'change': GEventObject;
}



/**
 * The MonitorSettings class definition.
 *
 * The MonitorSettings provides access to all configuration objects.
 *
 * @author Stefan Glaser
 */
class MonitorSettings extends EventDispatcher<MonitorSettingsEventMap>
{
  /** The remember configurations settings list. */
  rememberMap: Record<string, boolean>;

  /** The remember all configurations indicator. */
  rememberAll: boolean;

  /** The general monitor configuration. */
  monitorConfig: MonitorConfiguration;

  /**
   * MonitorSettings Constructor
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   */
  constructor ()
  {
    super();

    this.rememberMap = {};
    this.rememberAll = false;
    this.monitorConfig = new MonitorConfiguration();

    // Restore user configuration from local storage
    this.restore();
  }

  /**
   * Restore the user configurations from local storage.
   */
  restore (): void
  {
    // console.log('Restoring settings...');

    // Restore remember all setting
    let value = localStorage.getItem('rememberAll');
    if (value) {
      // console.log('Found rememberAll value: ' + value);
      this.rememberAll = !!value;
    }

    // Restore remember map
    value = localStorage.getItem('rememberMap');
    if (value) {
      // console.log('Found rememberMap value: ' + value);
      try {
        this.rememberMap = JSON.parse(value) as Record<string, boolean>;
      } catch (ex) {
        console.log('Exception parsing remember map!');
        console.log(ex);
      }
    }

    // restore individual configs
    this.restoreConfig(this.monitorConfig);
  }

  /**
   * Restore the specified user configuration from local storage.
   *
   * @param config the config to restore
   */
  restoreConfig (config: ConfigurationModel): void
  {
    const value = localStorage.getItem(config.getID());

    if (value) {
      // Found valid configuration value
       config.fromJSONString(value);
    }
  }

  /**
   * Save/Store the user configurations to the local storage.
   */
  save (): void
  {
    // console.log('Saving settings...');

    // Save configuration remembering settings
    localStorage.setItem('rememberAll', this.rememberAll.toString());
    localStorage.setItem('rememberMap', JSON.stringify(this.rememberMap));

    // Save individual configs
    this.saveConfig(this.monitorConfig);
  }

  /**
   * Save/Store the specified user configuration to the local storage.
   *
   * @param config the config to save/store
   */
  saveConfig (config: ConfigurationModel): void
  {
    const id = config.getID();
    if (this.rememberAll || this.rememberMap[id]) {
      localStorage.setItem(id, config.toJSONString());
    } else {
      localStorage.removeItem(id);
    }
  }

  /**
   * Enable/Disable remember setting for a specific configuration.
   *
   * @param config the configuration in question
   * @param remember true if the specified config should be stored in the local storage, false otherwise
   */
  setRememberConfig (config: ConfigurationModel, remember: boolean): void
  {
    this.rememberMap[config.getID()] = remember;

    // Publish change event
    this.dispatchEvent('change', {});
  }

  /**
   * Enable/Disable remember setting for a all configurations.
   *
   * @param remember true if all configurations should be stored in the local storage, false otherwise
   */
  setRememberAll (remember: boolean): void
  {
    this.rememberAll = remember;

    // Publish change event
      this.dispatchEvent('change', {});
  }
}

export { MonitorSettings };

import { getCurrentWindow } from '@tauri-apps/api/window';
import { getName } from '@tauri-apps/api/app';
import { type } from '@tauri-apps/plugin-os';
import { MinimizeIcon, MaximizeIcon, CloseIcon, ToggleMaximizeIcon } from 'common/icons';
import { SvgIcon } from '@mui/material';
import { createPortal } from 'react-dom';
import styles from './AppBar.module.css';
import React from 'react';
const appName = await getName();
const appWindow = getCurrentWindow();

const osType = type();

export default function AppBar() {
  const [maximizeIcon, setMaximizeIcon] = React.useState<typeof MaximizeIcon>(MaximizeIcon);
  const isMobile = ['ios', 'android'].includes(osType);

  return (
    <>
      <div className={styles.titlebar + ' text-on-surface'} data-tauri-drag-region>
        {!isMobile &&
          createPortal(
            <div
              className={styles.titlebarDecoration + ' text-on-surface'}
              data-tauri-drag-region
            >
              {appName}
            </div>,
            document.body
          )}
        {!isMobile && (
          <div>
            <div className={styles.titlebarButton} onClick={() => appWindow.minimize()}>
              <MinimizeIcon />
            </div>
            <div
              id="maximized"
              className={styles.titlebarButton}
              onClick={() => {
                appWindow.toggleMaximize();
                appWindow
                  .isMaximized()
                  .then((res) =>
                    res ? setMaximizeIcon(MaximizeIcon) : setMaximizeIcon(ToggleMaximizeIcon)
                  );
              }}
            >
              <SvgIcon component={maximizeIcon} />
            </div>
            <div
              className={`${styles.titlebarButton} ${styles.closeButton}`}
              onClick={() => appWindow.close()}
            >
              <CloseIcon />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

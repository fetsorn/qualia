import path from 'path';
import url from 'url';
import {
  app, BrowserWindow, ipcMain, shell, Menu,
} from 'electron';
import { ElectronAPI as API } from 'lib/api/electron.js';

let windows = {};

const createWindow = async () => {
  // NOTE: any use of dirname will fail nt
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'app/.webpack/renderer/public')
    : path.join(process.resourcesPath, '../../../../../../src/main/');

  const getAssetPath = (...paths) => path.join(RESOURCES_PATH, ...paths);

  const window = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon'),
    webPreferences: {
      preload: getAssetPath('preload.js'),
      contextIsolation: true,
    },
  });

  const windowID = window.id;

  windows[windowID] = window;

  // eslint-disable-next-line
  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  window.on('ready-to-show', () => {
    if (!windows[windowID]) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      windows[windowID].minimize();
    } else {
      windows[windowID].show();
    }
  });

  window.on('closed', () => {
    windows[windowID] = null;
  });

  // Open urls in the user's browser
  window.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  const isMac = process.platform === 'darwin';

  const macAppMenu = { role: 'appMenu' };

  const template = [
    ...(isMac ? [macAppMenu] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      label: 'More',
      submenu: [
        {
          label: 'New Window',
          click: () => {
            createWindow();
          },
        },
      ],
    },
    {
      role: 'help',
      submenu: app.isPackaged ? [] : [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/fetsorn/evenor');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.handle(
      'select',
      async (_event, dir, searchParams) => (new API(dir)).select(new URLSearchParams(searchParams)),
    );

    ipcMain.handle(
      'selectStream',
      async (_event, dir, searchParams) => {
        const windowID = _event.sender.id;

        function enqueueHandler(entry) {
          try {
            windows[windowID].send('selectStream:enqueue', entry);
          } catch {
            // do nothing
          }
        }

        function closeHandler() {
          try {
            windows[windowID].send('selectStream:close');
          } catch {
            // do nothing
          }
        }

        return (new API(dir)).selectStream(
          new URLSearchParams(searchParams),
          enqueueHandler,
          closeHandler
        );
      }
    );

    ipcMain.handle(
      'closeStream',
      (_event, dir) => {
        const windowID = _event.sender.id;

        return (new API(dir)).closeStream();
      }
    )

    ipcMain.handle(
      'queryOptions',
      async (_event, dir, branch) => (new API(dir)).queryOptions(branch),
    );

    ipcMain.handle(
      'updateEntry',
      async (_event, dir, entry, overview) => (new API(dir)).updateEntry(entry, overview),
    );

    ipcMain.handle(
      'deleteEntry',
      async (_event, dir, entry, overview) => (new API(dir)).deleteEntry(entry, overview),
    );

    ipcMain.handle(
      'ensure',
      async (_event, dir, schema, name) => (new API(dir)).ensure(schema, name),
    );

    ipcMain.handle(
      'commit',
      async (_event, dir) => (new API(dir)).commit(),
    );

    ipcMain.handle(
      'clone',
      async (_event, dir, remoteUrl, remoteToken, name) => (new API(dir)).clone(remoteUrl, remoteToken, name),
    );

    ipcMain.handle(
      'cloneView',
      async (_event, dir, remoteUrl, remoteToken) => (new API(dir)).cloneView(remoteUrl, remoteToken),
    );

    ipcMain.handle(
      'push',
      async (_event, dir, remote) => (new API(dir)).push(remote),
    );

    ipcMain.handle(
      'pull',
      async (_event, dir, remote) => (new API(dir)).pull(remote),
    );

    ipcMain.handle(
      'getSettings',
      async (_event, dir) => (new API(dir)).getSettings(),
    );

    ipcMain.handle(
      'readSchema',
      async (_event, dir) => (new API(dir)).readSchema(),
    );

    ipcMain.handle(
      'readGedcom',
      async (_event, dir) => (new API(dir)).readGedcom(),
    );

    ipcMain.handle(
      'readIndex',
      async (_event, dir) => (new API(dir)).readIndex(),
    );

    ipcMain.handle(
      'uploadFile',
      async (_event, dir) => (new API(dir)).uploadFile(),
    );

    ipcMain.handle(
      'fetchAsset',
      async (_event, dir, filename) => (new API(dir)).fetchAsset(filename),
    );

    ipcMain.handle(
      'downloadAsset',
      async (_event, dir, content, filename) => (new API(dir)).downloadAsset(
        content,
        filename,
      ),
    );

    ipcMain.handle(
      'putAsset',
      async (_event, dir, filename, content) => (new API(dir)).putAsset(filename, content),
    );

    ipcMain.handle(
      'writeFeed',
      async (_event, dir, xml) => (new API(dir)).writeFeed(xml),
    );

    ipcMain.handle(
      'uploadBlobsLFS',
      async (_event, dir, remote, files) => (new API(dir).uploadBlobsLFS(
        remote,
        files,
      )),
    );

    ipcMain.handle('zip', async (_event, dir) => (new API(dir)).zip());

    ipcMain.handle('listRemotes', async (_event, dir) => (new API(dir)).listRemotes());

    ipcMain.handle('getRemote', async (_event, dir, remote) => (new API(dir)).getRemote(remote));

    ipcMain.handle('addRemote', async (_event, dir, remoteName, remoteUrl, remoteToken) => (new API(dir)).addRemote(remoteName, remoteUrl, remoteToken));

    ipcMain.handle('addAssetPath', async (_event, dir, assetPath) => (new API(dir)).addAssetPath(assetPath));

    ipcMain.handle('listAssetPaths', async (_event, dir) => (new API(dir)).listAssetPaths());

    ipcMain.handle(
      'downloadUrlFromPointer',
      async (_event, dir, remote, token, pointerInfo) => API.downloadUrlFromPointer(
        remote,
        token,
        pointerInfo,
      ),
    );

    createWindow();
  })
  .catch(console.log);

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

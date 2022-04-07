import { Button } from '@components'
import styles from './Header.module.css'

import { fetchDataMetadir, writeDataMetadir, commit, wipe } from '@utils'

import * as csvs from '@fetsorn/csvs-js'

const Header = ({isEdit, setIsEdit, setEvent}) => {

  const logout = async () => {

    window.localStorage.removeItem('antea_url')
    window.localStorage.removeItem('antea')

    await wipe()

    window.open("/","_self")
  }

  const home = () => {
    window.open("/","_self")
  }

  return (
  <header className={styles.header}>
    { (process.env.REACT_APP_BUILD_MODE != "local") && (
      <div>
        <h1 className={styles.title}></h1>
        <Button type="button" onClick={logout}>Logout</Button>
        <Button type="button" onClick={home}>Home</Button>
        {isEdit && (
          <div>
            <Button type="button" onClick={async () => {
              let token = window.prompt('key')
              await commit(token)
            }}>Commit</Button>
            <Button type="button" onClick={async () => {
              setEvent(await (await csvs).editEvent({}, {fetch: fetchDataMetadir, write: writeDataMetadir}))
            }}>New event</Button>
          </div>
        )}
        {setIsEdit && (
          <label>edit:
            <input type="checkbox" checked={isEdit} onChange={(e) => {
              console.log(isEdit, e.target.checked);
              setIsEdit(e.target.checked)}}
            />
          </label>
        )}
      </div>
    )}
  </header>
  )}

export default Header

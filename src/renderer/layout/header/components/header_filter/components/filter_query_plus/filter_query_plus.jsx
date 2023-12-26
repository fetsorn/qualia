import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_query_plus.module.css';
import {
  Dropdown,
} from '@/components/index.js';

export function FilterQueryPlus({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		queries,
    schema,
    onQueryAdd,
		changeGroupBy,
  ] = useStore((state) => [
		state.queries,
    state.schema,
    state.onQueryAdd,
		state.changeGroupBy,
  ]);
	

const addedField = Object.keys(queries)

const menuItems = Object.keys(schema)
  .filter(key => !addedField.includes(key)) 
  .map(key => ({
    onClick: () => {
      onQueryAdd(key, "");
    },
    label: key
  }));

  return (
    <div className={styles.search}>
			<Dropdown {...{
        label:"+",
  			title:"title",
				menuItems,
      }}/>
			<button onClick={changeGroupBy}></button>
    </div>
  );
}

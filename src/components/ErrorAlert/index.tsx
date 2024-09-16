import { CalciteAlert } from '@esri/calcite-components-react';
import '@esri/calcite-components/dist/components/calcite-alert';
import state from '../../stores/state';
import { observer } from 'mobx-react-lite';

export const ErrorAlert = observer(() => {
  const { error } = state;
  if (error && error.name && error.message) {
    return (
      <CalciteAlert icon='rangefinder' kind='danger' open label='Loading error' placement='bottom-end'>
        <div slot='title'>{error.name}</div>
        <div slot='message'>{error.message}</div>
      </CalciteAlert>
    );
  } else {
    return null;
  }
});

import { ErrorAlert } from '../ErrorAlert';
import { Identity } from '../Identity';
import { Map } from '../Map';
import { Noise } from '../Noise';

const App = () => {
  return (
    <>
      <Map></Map>
      <Identity></Identity>
      <ErrorAlert></ErrorAlert>
      <Noise></Noise>
    </>
  );
};

export default App;

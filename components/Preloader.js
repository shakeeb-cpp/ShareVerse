import {ClipLoader} from "react-spinners";

export default function Preloader({size}) {
  return (
    <ClipLoader size={size} speedMultiplier={1}  color={'#348DFA'} />
  );
}